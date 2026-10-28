import { requisitar } from "../../../../shared/services/httpClient";
import type { Checkpoint, Coordenada, TipoCheckpoint, TrajetoDetalhado, TrajetoIniciado } from "../types";

/** POST /api/v1/entregas/{entregaId}/viagem/iniciar (HU04, FR-001). */
export function iniciarViagem(entregaId: string, posicao: Coordenada | null): Promise<TrajetoIniciado> {
  return requisitar<TrajetoIniciado>(`/api/v1/entregas/${entregaId}/viagem/iniciar`, {
    metodo: "POST",
    corpo: { lat: posicao?.latitude ?? null, lng: posicao?.longitude ?? null },
  });
}

/** GET /api/v1/entregas/{entregaId}/viagem (HU04) - 404 quando a viagem ainda não começou. */
export function consultarTrajeto(entregaId: string): Promise<TrajetoDetalhado> {
  return requisitar<TrajetoDetalhado>(`/api/v1/entregas/${entregaId}/viagem`);
}

/** POST /api/v1/entregas/{entregaId}/viagem/checkpoints (HU04; marcos de progresso de HU20). */
export function registrarCheckpoint(entregaId: string, tipo: TipoCheckpoint, posicao: Coordenada | null): Promise<Checkpoint> {
  return requisitar<Checkpoint>(`/api/v1/entregas/${entregaId}/viagem/checkpoints`, {
    metodo: "POST",
    corpo: { tipo, lat: posicao?.latitude ?? null, lng: posicao?.longitude ?? null },
  });
}

/** POST /api/v1/entregas/{entregaId}/viagem/encerrar (HU04, RN14) - 422 quando a divergência exige justificativa. */
export function encerrarTrajeto(entregaId: string, justificativaDivergencia: string | null): Promise<TrajetoDetalhado> {
  return requisitar<TrajetoDetalhado>(`/api/v1/entregas/${entregaId}/viagem/encerrar`, {
    metodo: "POST",
    corpo: { justificativaDivergencia },
  });
}
