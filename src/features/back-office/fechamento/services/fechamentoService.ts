import { baixarArquivo, requisitar } from "../../../../shared/services/httpClient";
import type { Fechamento, FechamentoDetalhe, PagamentoMotorista, RelatorioPdf } from "../types";
import { caminhoApi } from "../../../../shared/services/caminhoApi";

export const listarFechamentos = () => requisitar<Fechamento[]>("/api/v1/fechamentos");
export const gerarFechamento = (periodoInicio: string, periodoFim: string) =>
  requisitar<Fechamento>("/api/v1/fechamentos", { metodo: "POST", corpo: { periodoInicio, periodoFim } });
export const detalharFechamento = (id: string) => requisitar<FechamentoDetalhe>(caminhoApi`/api/v1/fechamentos/${id}`);

/** V60: pagamento da quinzena de cada motorista - listar, agendar, marcar como pago e desfazer o pago (com motivo). */
export const listarPagamentos = (fechamentoId: string) =>
  requisitar<PagamentoMotorista[]>(caminhoApi`/api/v1/fechamentos/${fechamentoId}/pagamentos`);
export const agendarPagamento = (fechamentoId: string, motoristaId: string, data: string) =>
  requisitar<void>(caminhoApi`/api/v1/fechamentos/${fechamentoId}/pagamentos/${motoristaId}/agendamento`, {
    metodo: "POST",
    corpo: { data },
  });
export const marcarPago = (fechamentoId: string, motoristaId: string, data: string) =>
  requisitar<void>(caminhoApi`/api/v1/fechamentos/${fechamentoId}/pagamentos/${motoristaId}/pago`, { metodo: "POST", corpo: { data } });
export const desfazerPago = (fechamentoId: string, motoristaId: string, motivo: string) =>
  requisitar<void>(caminhoApi`/api/v1/fechamentos/${fechamentoId}/pagamentos/${motoristaId}/desfazer-pago`, {
    metodo: "POST",
    corpo: { motivo },
  });

/** Baixa o PDF com a autorização da sessão e dispara o download no navegador. */
export async function baixarRelatorio(fechamento: Fechamento | FechamentoDetalhe, tipo: RelatorioPdf): Promise<void> {
  const blob = await baixarArquivo(caminhoApi`/api/v1/fechamentos/${fechamento.id}/${tipo}.pdf`);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${tipo}-${fechamento.periodoInicio}-a-${fechamento.periodoFim}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
