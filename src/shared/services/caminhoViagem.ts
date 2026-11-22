import { bancoLocal, type PontoCaminho } from "./db";
import { requisitar } from "./httpClient";
import type { PosicaoLida } from "../utils/posicaoAtual";

/**
 * Item 9: caminho percorrido na viagem. Cada ponto lido é guardado no aparelho (também sem internet) e enviado em lotes
 * à API, que soma o km percorrido. Ponto confirmado sai do aparelho; ponto cuja viagem ainda não chegou ao servidor
 * (iniciada sem internet) fica para o próximo envio, por até {@link PRAZO_PENDENTE_MS}.
 */

const LOTE = 200;
/** O servidor recalcula o km a cada lote: um envio por minuto basta (e os pontos ficam guardados no meio tempo). */
const INTERVALO_ENVIO_MS = 60_000;
const PRAZO_PENDENTE_MS = 48 * 60 * 60 * 1000;
/** Ponto pendente sai da fila de envio por este tempo: não trava os outros pontos atrás dele. */
const ADIAMENTO_PENDENTE_MS = 10 * 60 * 1000;

let enviando = false;
let ultimoEnvio = 0;

export async function gravarPontoDoCaminho(entregaId: string, posicao: PosicaoLida): Promise<void> {
  const ponto: PontoCaminho = {
    idLocal: crypto.randomUUID(),
    entregaId,
    latitude: posicao.latitude,
    longitude: posicao.longitude,
    precisaoMetros: posicao.precisaoMetros ?? null,
    dataHora: new Date().toISOString(),
  };
  try {
    await bancoLocal.pontosCaminho.put(ponto);
  } catch {
    // Armazenamento indisponível: perde só este ponto (o trecho é completado pela estrada no servidor).
  }
}

/** Envia o que estiver guardado. {@code agora}: ignora o intervalo (ex.: ao finalizar a entrega ou voltar a internet). */
export async function enviarCaminhoPendente(agora = false): Promise<void> {
  if (enviando || !navigator.onLine || (!agora && Date.now() - ultimoEnvio < INTERVALO_ENVIO_MS)) {
    return;
  }
  enviando = true;
  ultimoEnvio = Date.now();
  try {
    for (;;) {
      const agoraMs = Date.now();
      const lote = await bancoLocal.pontosCaminho
        .orderBy("dataHora")
        .filter((p) => !p.adiadoAte || p.adiadoAte <= agoraMs)
        .limit(LOTE)
        .toArray();
      if (lote.length === 0) {
        return;
      }
      const { pendentes } = await requisitar<{ aceitas: number; pendentes: string[] }>("/api/v1/motorista/viagem/posicoes", {
        metodo: "POST",
        corpo: { posicoes: lote.map(({ adiadoAte: _adiado, ...ponto }) => ponto) },
      });
      const manter = new Set(pendentes);
      const vencidos = Date.now() - PRAZO_PENDENTE_MS;
      const remover = lote.filter((p) => !manter.has(p.idLocal) || Date.parse(p.dataHora) < vencidos).map((p) => p.idLocal);
      await bancoLocal.pontosCaminho.bulkDelete(remover);
      const adiar = lote.filter((p) => !remover.includes(p.idLocal));
      if (adiar.length > 0) {
        const ate = Date.now() + ADIAMENTO_PENDENTE_MS;
        await bancoLocal.pontosCaminho.bulkPut(adiar.map((p) => ({ ...p, adiadoAte: ate })));
      }
      // Último lote: o resto (se houver) fica para o próximo ciclo. Os adiados não voltam neste laço.
      if (lote.length < LOTE) {
        return;
      }
    }
  } catch {
    // Falha de rede ou da API: os pontos continuam guardados para o próximo envio.
  } finally {
    enviando = false;
  }
}
