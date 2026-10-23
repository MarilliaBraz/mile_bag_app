import { requisitar } from "../../../shared/api/httpClient";

/** Espelha com.marillia.milebag.business.viagem.model.CampoAjusteViagem. */
export type CampoAjuste = "KM_IDA" | "KM_VOLTA" | "TARIFA_APLICADA" | "VALOR_PEDAGIO";

/** Espelha com.marillia.milebag.business.viagem.model.ItemRelatorioMotoristaResponse. */
export type ItemRelatorio = {
  entregaId: string;
  viagemId: string;
  bdoNumero: string | null;
  kmIda: number | null;
  kmVolta: number | null;
  /** `null` = sem base de cálculo ainda (ex.: nenhuma tarifa configurada) - nunca um zero inventado. */
  tarifaAplicada: number | null;
  valorPedagio: number | null;
  temAjuste: boolean;
};

/** Espelha com.marillia.milebag.business.viagem.model.RelatorioQuinzenalResponse. */
export type RelatorioQuinzenal = {
  periodoInicio: string;
  periodoFim: string;
  entregas: ItemRelatorio[];
};

/** Espelha com.marillia.milebag.business.viagem.model.AjusteViagemResponse. */
export type Ajuste = {
  id: string;
  campo: CampoAjuste;
  valorAnterior: string;
  valorNovo: string;
  justificativa: string;
  criadoEm: string;
};

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
