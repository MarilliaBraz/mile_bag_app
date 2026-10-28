import { baixarArquivo, requisitar } from "../../../../shared/services/httpClient";
import type { Fechamento, FechamentoDetalhe, RelatorioPdf } from "../types";

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
