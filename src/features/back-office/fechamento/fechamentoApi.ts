import { baixarArquivo, requisitar } from "../../../shared/api/httpClient";

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

export const listarFechamentos = () => requisitar<Fechamento[]>("/api/v1/fechamentos");
export const gerarFechamento = (periodoInicio: string, periodoFim: string) =>
  requisitar<Fechamento>("/api/v1/fechamentos", { metodo: "POST", corpo: { periodoInicio, periodoFim } });
export const detalharFechamento = (id: string) => requisitar<FechamentoDetalhe>(`/api/v1/fechamentos/${id}`);

/** Baixa o PDF com a autorização da sessão e dispara o download no navegador. */
export async function baixarRelatorio(fechamento: Fechamento | FechamentoDetalhe, tipo: RelatorioPdf): Promise<void> {
  const blob = await baixarArquivo(`/api/v1/fechamentos/${fechamento.id}/${tipo}.pdf`);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${tipo}-${fechamento.periodoInicio}-a-${fechamento.periodoFim}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
