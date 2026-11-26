import { formatarData } from "../../../../shared/utils/formatar";
import type { PagamentoMotorista } from "../types";

/** "A agendar", "Agendado para 30/11/2026" ou "Pago em 28/11/2026". */
export function rotuloSituacao(
  pagamento: Pick<PagamentoMotorista, "situacao" | "dataAgendada" | "pagoEm">,
  t: { aAgendar: string; agendadoPara: (data: string) => string; pagoEm: (data: string) => string },
): string {
  if (pagamento.situacao === "PAGO") {
    return t.pagoEm(formatarData(pagamento.pagoEm));
  }
  if (pagamento.situacao === "AGENDADO") {
    return t.agendadoPara(formatarData(pagamento.dataAgendada));
  }
  return t.aAgendar;
}
