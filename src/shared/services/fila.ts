import { ApiError } from "./ApiError";
import { bancoLocal } from "./db";
import type { RegistroPendente, TipoEventoSincronizacao } from "../types/offlineSync";
import { proximaSequenciaLocal } from "./sequenciaLocal";

/**
 * Grava um evento na fila local (HU08, FR-001/FR-007). É o ponto de
 * integração que as telas de HU01 a HU07 usam quando a ação é executada sem
 * conexão.
 */
export async function enfileirar(tipoEvento: TipoEventoSincronizacao, payload: unknown): Promise<RegistroPendente> {
  const registro: RegistroPendente = {
    idLocal: crypto.randomUUID(),
    sequenciaLocal: proximaSequenciaLocal(),
    tipoEvento,
    payload,
    timestampCriacaoLocal: new Date().toISOString(),
    status: "PENDENTE",
    tentativas: 0,
    motivo: null,
  };
  await bancoLocal.registrosPendentes.add(registro);
  return registro;
}

/** Fila a enviar, na ordem de criação no dispositivo (FR-005) - inclui os que falharam antes, para nova tentativa. */
export async function listarParaEnviar(): Promise<RegistroPendente[]> {
  const registros = await bancoLocal.registrosPendentes.where("status").anyOf("PENDENTE", "ERRO").toArray();
  return registros.sort((a, b) => a.sequenciaLocal - b.sequenciaLocal);
}

export function contarPendentes(): Promise<number> {
  return bancoLocal.registrosPendentes.where("status").anyOf("PENDENTE", "ERRO").count();
}

/**
 * Falha de rede (servidor inalcançável) é diferente de erro de negócio: a
 * primeira vira fila offline, a segunda tem que chegar ao motorista. Como
 * o `httpClient` converte toda resposta HTTP em {@link ApiError}, o que
 * sobra - `TypeError` do `fetch` - é justamente a falta de conexão.
 */
export function ehFalhaDeRede(excecao: unknown): boolean {
  return !(excecao instanceof ApiError);
}

/**
 * Executa a ação online e, se o dispositivo estiver sem conexão (ou o
 * servidor inalcançável), enfileira o evento equivalente em vez de falhar
 * (FR-001). Erros de negócio do servidor continuam subindo para a tela.
 */
export async function executarOuEnfileirar<T>(
  acaoOnline: () => Promise<T>,
  evento: { tipoEvento: TipoEventoSincronizacao; payload: unknown },
): Promise<{ enfileirado: boolean; resultado?: T }> {
  if (!navigator.onLine) {
    await enfileirar(evento.tipoEvento, evento.payload);
    return { enfileirado: true };
  }

  try {
    return { enfileirado: false, resultado: await acaoOnline() };
  } catch (excecao) {
    if (ehFalhaDeRede(excecao)) {
      await enfileirar(evento.tipoEvento, evento.payload);
      return { enfileirado: true };
    }
    throw excecao;
  }
}

/** Foto/imagem só trafega como base64 no lote de sincronização (ver os payloads de `business/sincronizacao`). */
export function arquivoParaBase64(arquivo: File): Promise<string> {
  return new Promise((resolver, rejeitar) => {
    const leitor = new FileReader();
    leitor.onload = () => {
      const resultado = String(leitor.result);
      // dataURL vem como "data:image/jpeg;base64,XXXX" - o servidor espera só o conteúdo.
      resolver(resultado.slice(resultado.indexOf(",") + 1));
    };
    leitor.onerror = () => rejeitar(leitor.error);
    leitor.readAsDataURL(arquivo);
  });
}
