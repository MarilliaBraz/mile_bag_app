import { requisitar } from "../../../../shared/services/httpClient";
import type { Ajuste, CampoAjuste, RelatorioQuinzenal } from "../types";

/** GET /api/v1/motorista/relatorio-quinzenal (HU17, FR-001). */
export function consultarRelatorio(periodoInicio: string, periodoFim: string): Promise<RelatorioQuinzenal> {
  return requisitar<RelatorioQuinzenal>(`/api/v1/motorista/relatorio-quinzenal?periodoInicio=${periodoInicio}&periodoFim=${periodoFim}`);
}

/** GET /api/v1/motorista/viagens/{viagemId}/ajustes - histórico completo, mais recente primeiro (FR-005). */
export function listarAjustes(viagemId: string): Promise<Ajuste[]> {
  return requisitar<Ajuste[]>(`/api/v1/motorista/viagens/${viagemId}/ajustes`);
}

/** POST /api/v1/motorista/viagens/{viagemId}/ajustes (HU17, FR-003/FR-004) - sempre cria um registro novo. */
export function registrarAjuste(
  viagemId: string,
  ajuste: { campo: CampoAjuste; valorNovo: string; justificativa: string },
): Promise<Ajuste> {
  return requisitar<Ajuste>(`/api/v1/motorista/viagens/${viagemId}/ajustes`, { metodo: "POST", corpo: ajuste });
}
