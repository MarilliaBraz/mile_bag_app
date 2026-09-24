import { requisitar } from "../../../../shared/api/httpClient";
import type { BdosDisponiveis, ItemPainelDetalhe, PainelEntregas } from "../types";

/** GET /api/v1/motorista/painel-entregas (HU19, FR-002). */
export function consultarPainel(): Promise<PainelEntregas> {
  return requisitar<PainelEntregas>("/api/v1/motorista/painel-entregas");
}

/** GET /api/v1/entregas/{entregaId}/detalhe (HU19, FR-003). */
export function consultarDetalhe(entregaId: string): Promise<ItemPainelDetalhe> {
  return requisitar<ItemPainelDetalhe>(`/api/v1/entregas/${entregaId}/detalhe`);
}

/** GET /api/v1/motorista/bdos-disponiveis (HU19, FR-007). */
export function consultarBdosDisponiveis(): Promise<BdosDisponiveis> {
  return requisitar<BdosDisponiveis>("/api/v1/motorista/bdos-disponiveis");
}

/** POST /api/v1/entregas/{bdoId}/autoatribuir (HU02, FR-009 desta HU). */
export function autoatribuir(bdoId: string): Promise<void> {
  return requisitar<void>(`/api/v1/entregas/${bdoId}/autoatribuir`, { metodo: "POST" });
}
