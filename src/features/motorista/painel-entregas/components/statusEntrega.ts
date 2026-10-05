import type { EntregaStatus } from "../types";

/** Rótulo e tom do selo de status da entrega - sempre com texto, a cor só reforça. */
export const STATUS_ENTREGA: Record<EntregaStatus, { texto: string; tom: "info" | "sucesso" | "aviso" | "erro" }> = {
  AGUARDANDO_ATRIBUICAO: { texto: "Aguardando", tom: "aviso" },
  ATRIBUIDA: { texto: "A iniciar", tom: "info" },
  EM_ANDAMENTO: { texto: "Em andamento", tom: "info" },
  ENCERRADA_COM_SUCESSO: { texto: "Entregue", tom: "sucesso" },
  REABERTA: { texto: "Nova tentativa", tom: "aviso" },
};
