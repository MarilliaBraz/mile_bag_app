import { requisitar } from "../../../../shared/api/httpClient";
import type { CalculoRotas, Coordenada, RotaSelecionada, TipoSelecao } from "../types";

/** POST /api/v1/entregas/{entregaId}/rotas/calcular (HU03, FR-001/FR-002). */
export function calcularRotas(
  entregaId: string,
  origemAtual: Coordenada | null,
  destinoManual: Coordenada | null = null,
): Promise<CalculoRotas> {
  return requisitar<CalculoRotas>(`/api/v1/entregas/${entregaId}/rotas/calcular`, {
    metodo: "POST",
    corpo: { origemAtual, destinoManual },
  });
}

/** POST /api/v1/entregas/{entregaId}/rotas/selecionar (HU03, FR-003/FR-004/FR-005). */
export function selecionarRota(
  entregaId: string,
  selecao: { tipoSelecao: TipoSelecao; alternativaId?: string; tracadoManual?: Coordenada[]; justificativa?: string },
): Promise<RotaSelecionada> {
  return requisitar<RotaSelecionada>(`/api/v1/entregas/${entregaId}/rotas/selecionar`, {
    metodo: "POST",
    corpo: {
      tipoSelecao: selecao.tipoSelecao,
      alternativaId: selecao.alternativaId ?? null,
      tracadoManual: selecao.tracadoManual ?? null,
      justificativa: selecao.justificativa ?? null,
    },
  });
}
