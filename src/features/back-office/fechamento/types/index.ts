export type StatusFechamento = "COMPLETO" | "COM_PENDENCIAS";

export type StatusItemFechamento = "CALCULADO" | "PENDENTE";

/** Espelha TotalPorMotorista: pagamento e reembolso nunca são somados (FR-003). */
export type TotalPorMotorista = { motoristaId: string; totalPagamentoEntregas: number; totalReembolsoPedagios: number };

/** Espelha FechamentoResponse (POST e lista). */
export type Fechamento = {
  id: string;
  periodoInicio: string;
  periodoFim: string;
  geradoEm: string;
  status: StatusFechamento;
  totaisPorMotorista: TotalPorMotorista[];
};

/** Espelha ItemFechamentoResponse. */
export type ItemFechamento = {
  id: string;
  entregaId: string;
  motoristaId: string;
  valorPagamentoEntrega: number | null;
  valorReembolsoPedagio: number | null;
  statusItem: StatusItemFechamento;
  motivoPendencia: string | null;
  /** Viagem de uma tentativa sem sucesso (ocorrência), paga a quem dirigiu. */
  tentativaSemSucesso?: boolean;
};

/** Espelha FechamentoDetalheResponse. */
export type FechamentoDetalhe = Omit<Fechamento, "totaisPorMotorista"> & { itens: ItemFechamento[] };

export type RelatorioPdf = "relatorio-pagamento-entregas" | "relatorio-reembolso-pedagios";
