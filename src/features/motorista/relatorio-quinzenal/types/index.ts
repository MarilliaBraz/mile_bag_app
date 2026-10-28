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
  /** Viagem de uma tentativa sem sucesso (ocorrência): paga a quem dirigiu, mesmo sem a entrega concluída. */
  tentativaSemSucesso?: boolean;
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
