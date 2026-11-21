import { ApiError } from "./ApiError";
import { requisitar } from "./httpClient";
import { obterTenantId } from "./authStorage";
import type { MotivoOcorrencia, OcorrenciaResponse } from "../types/ocorrencia";
import { caminhoApi } from "./caminhoApi";

/** Listas do cadastro de motivos que o motorista lê no campo, inclusive sem conexão. */
export type FinalidadeLidaPeloMotorista = "OCORRENCIA" | "RECEBEDOR";

// A chave da ocorrência continua a de antes, para não perder a cópia já guardada nos aparelhos.
const chaveCacheMotivos = (finalidade: FinalidadeLidaPeloMotorista) =>
  finalidade === "OCORRENCIA"
    ? `milebag.motivosOcorrencia.${obterTenantId() ?? "sem-empresa"}`
    : `milebag.motivos.${finalidade}.${obterTenantId() ?? "sem-empresa"}`;

function lerCacheMotivos(finalidade: FinalidadeLidaPeloMotorista): MotivoOcorrencia[] | null {
  try {
    const texto = localStorage.getItem(chaveCacheMotivos(finalidade));
    return texto ? (JSON.parse(texto) as MotivoOcorrencia[]) : null;
  } catch {
    return null;
  }
}

function guardarCacheMotivos(finalidade: FinalidadeLidaPeloMotorista, motivos: MotivoOcorrencia[]): void {
  try {
    localStorage.setItem(chaveCacheMotivos(finalidade), JSON.stringify(motivos));
  } catch {
    // Sem armazenamento local a tela só perde o modo offline dos motivos; nada a fazer.
  }
}

/**
 * GET /api/v1/configuracoes/motivos-ocorrencia (HU11) - lista configurada pelo administrador do tenant, lida pelo motorista.
 * Cada leitura com sucesso atualiza uma cópia no aparelho (por empresa): sem conexão, a ocorrência offline (HU07/HU08)
 * ainda consegue listar os motivos. Erro da API (ex.: 403) não cai no cache - só falha de rede. V48: a mesma cópia serve
 * à lista de quem pode assinar o recebimento (RECEBEDOR), usada no comprovante offline.
 */
export async function listarMotivosComOrigem(
  finalidade: FinalidadeLidaPeloMotorista = "OCORRENCIA",
): Promise<{ motivos: MotivoOcorrencia[]; doCache: boolean }> {
  try {
    const motivos = await requisitar<MotivoOcorrencia[]>(
      `/api/v1/configuracoes/motivos-ocorrencia?finalidade=${encodeURIComponent(finalidade)}`,
    );
    guardarCacheMotivos(finalidade, motivos);
    return { motivos, doCache: false };
  } catch (excecao) {
    const copia = excecao instanceof ApiError ? null : lerCacheMotivos(finalidade);
    if (copia) {
      return { motivos: copia, doCache: true };
    }
    throw excecao;
  }
}

export async function listarMotivos(finalidade: FinalidadeLidaPeloMotorista = "OCORRENCIA"): Promise<MotivoOcorrencia[]> {
  return (await listarMotivosComOrigem(finalidade)).motivos;
}

/** POST /api/v1/entregas/{entregaId}/ocorrencias (HU07) - reabre a entrega para nova tentativa. */
export function registrarOcorrencia(
  entregaId: string,
  dados: {
    motivoOcorrenciaId: string;
    descricaoAdicional: string | null;
    idLocal: string;
    janelaInicio: string | null;
    janelaFim: string | null;
  },
): Promise<OcorrenciaResponse> {
  return requisitar<OcorrenciaResponse>(caminhoApi`/api/v1/entregas/${entregaId}/ocorrencias`, { metodo: "POST", corpo: dados });
}

/** GET /api/v1/entregas/{entregaId}/ocorrencias (HU07) - histórico de tentativas da entrega. */
export function listarOcorrencias(entregaId: string): Promise<OcorrenciaResponse[]> {
  return requisitar<OcorrenciaResponse[]>(caminhoApi`/api/v1/entregas/${entregaId}/ocorrencias`);
}
