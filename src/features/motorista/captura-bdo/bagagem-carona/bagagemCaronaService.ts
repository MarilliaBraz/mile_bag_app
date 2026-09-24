import { requisitar } from "../../../../shared/api/httpClient";

/** Espelha com.marillia.milebag.business.entrega.bagagemcarona.BagagemCaronaResponse. */
export type BagagemCaronaResponse = {
  id: string;
  entregaPrincipalId: string;
  bdoId: string;
  quilometragemComplementar: string;
  criadoEm: string;
};

/** POST /api/v1/entregas/{entregaId}/bagagens-carona (HU05, FR-001). */
export function vincularBagagemCarona(entregaId: string, bdoId: string): Promise<BagagemCaronaResponse> {
  return requisitar<BagagemCaronaResponse>(`/api/v1/entregas/${entregaId}/bagagens-carona`, {
    metodo: "POST",
    corpo: { bdoId },
  });
}

/** DELETE /api/v1/entregas/{entregaId}/bagagens-carona/{bagagemCaronaId} (HU05). */
export function desvincularBagagemCarona(entregaId: string, bagagemCaronaId: string): Promise<void> {
  return requisitar<void>(`/api/v1/entregas/${entregaId}/bagagens-carona/${bagagemCaronaId}`, { metodo: "DELETE" });
}
