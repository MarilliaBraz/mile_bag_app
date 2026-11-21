import { requisitar } from "../../../../shared/services/httpClient";
import type { EntregaStatus } from "../../../motorista/painel-entregas/types";
import type { EntregaGestao, HistoricoEntrega } from "../types";
import { caminhoApi } from "../../../../shared/services/caminhoApi";

const BASE = "/api/v1/gestao/entregas";

/** GET /api/v1/gestao/entregas - as mais recentemente movimentadas primeiro; sem status, todas. */
export const listarEntregas = (status: EntregaStatus | null) =>
  requisitar<EntregaGestao[]>(status ? BASE + caminhoApi`?status=${status}` : BASE);

/** GET /api/v1/gestao/entregas/{id}/historico - a linha do tempo da mala. */
export const consultarHistorico = (entregaId: string) => requisitar<HistoricoEntrega>(BASE + caminhoApi`/${entregaId}/historico`);
