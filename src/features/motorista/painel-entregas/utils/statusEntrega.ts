import type { EntregaStatus } from "../types";

/** Tom do selo de status da entrega - o texto (motorista.status) sempre acompanha, a cor só reforça. */
export const TOM_STATUS_ENTREGA: Record<EntregaStatus, "info" | "sucesso" | "aviso" | "erro"> = {
  AGUARDANDO_ATRIBUICAO: "aviso",
  ATRIBUIDA: "info",
  EM_ANDAMENTO: "info",
  ENCERRADA_COM_SUCESSO: "sucesso",
  REABERTA: "aviso",
};
