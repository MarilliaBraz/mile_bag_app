import type { SituacaoPagamento } from "../../fechamento/types";

/** Espelha PagamentoPendenteResponse: quinzena calculada de um motorista que ainda não foi paga. */
export type PagamentoPendente = {
  fechamentoId: string;
  periodoInicio: string;
  periodoFim: string;
  motoristaId: string;
  situacao: Exclude<SituacaoPagamento, "PAGO">;
  dataAgendada: string | null;
};
