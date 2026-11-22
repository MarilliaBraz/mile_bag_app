import { requisitar } from "../../../../../shared/services/httpClient";
import type { BagagemCaronaResponse } from "../types";
import type { ItemBdoDisponivel } from "../../types";
import { caminhoApi } from "../../../../../shared/services/caminhoApi";

/** POST /api/v1/entregas/{entregaId}/bagagens-carona (HU05, FR-001). */
export function vincularBagagemCarona(entregaId: string, bdoId: string): Promise<BagagemCaronaResponse> {
  return requisitar<BagagemCaronaResponse>(caminhoApi`/api/v1/entregas/${entregaId}/bagagens-carona`, {
    metodo: "POST",
    corpo: { bdoId },
  });
}

/** DELETE /api/v1/entregas/{entregaId}/bagagens-carona/{bagagemCaronaId} (HU05). */
export function desvincularBagagemCarona(entregaId: string, bagagemCaronaId: string): Promise<void> {
  return requisitar<void>(caminhoApi`/api/v1/entregas/${entregaId}/bagagens-carona/${bagagemCaronaId}`, { metodo: "DELETE" });
}

/** GET /api/v1/entregas/{entregaId}/sugestoes-carona (item 8) - BDOs disponíveis que vão para o mesmo endereço. */
export function consultarSugestoesCarona(entregaId: string): Promise<ItemBdoDisponivel[]> {
  return requisitar<ItemBdoDisponivel[]>(caminhoApi`/api/v1/entregas/${entregaId}/sugestoes-carona`);
}
