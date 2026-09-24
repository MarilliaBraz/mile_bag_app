import { requisitar } from "../../../shared/api/httpClient";

/** Espelha com.marillia.milebag.business.configuracao.model.MotivoOcorrenciaResponse (só motivos ativos). */
export type MotivoOcorrencia = {
  id: string;
  descricao: string;
};

/** Espelha com.marillia.milebag.business.ocorrencia.model.OcorrenciaResponse. */
export type OcorrenciaResponse = {
  id: string;
  entregaId: string;
  motivoOcorrenciaId: string;
  dataHora: string;
  entregaStatus: string;
};

/** GET /api/v1/configuracoes/motivos-ocorrencia (HU11) - lista configurada pelo administrador do tenant, lida pelo motorista. */
export function listarMotivos(): Promise<MotivoOcorrencia[]> {
  return requisitar<MotivoOcorrencia[]>("/api/v1/configuracoes/motivos-ocorrencia");
}

/** POST /api/v1/entregas/{entregaId}/ocorrencias (HU07) - reabre a entrega para nova tentativa. */
export function registrarOcorrencia(
  entregaId: string,
  dados: { motivoOcorrenciaId: string; descricaoAdicional: string | null; idLocal: string },
): Promise<OcorrenciaResponse> {
  return requisitar<OcorrenciaResponse>(`/api/v1/entregas/${entregaId}/ocorrencias`, { metodo: "POST", corpo: dados });
}

/** GET /api/v1/entregas/{entregaId}/ocorrencias (HU07) - histórico de tentativas da entrega. */
export function listarOcorrencias(entregaId: string): Promise<OcorrenciaResponse[]> {
  return requisitar<OcorrenciaResponse[]>(`/api/v1/entregas/${entregaId}/ocorrencias`);
}
