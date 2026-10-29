import type { EtapaEntrega } from "../types";

/** Cor do selo da etapa (HU37): espera em aviso, andamento em informação, fim em sucesso ou erro. */
export function classeEtapa(etapa: EtapaEntrega): string {
  switch (etapa) {
    case "ENTREGUE":
      return "selo selo-sucesso";
    case "NAO_ENTREGUE":
      return "selo selo-erro";
    case "AGUARDANDO_MOTORISTA":
      return "selo selo-aviso";
    default:
      return "selo selo-info";
  }
}
