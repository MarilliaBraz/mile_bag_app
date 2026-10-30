import { requisitar } from "../../../shared/services/httpClient";
import type { PedidoDemonstracao } from "../types";

/** Público (sem login): a API manda o pedido por e-mail para a equipe do Milebag (contracts/demonstracao-api.md). */
export function pedirDemonstracao(pedido: PedidoDemonstracao): Promise<void> {
  return requisitar<void>("/api/v1/publico/demonstracao", { metodo: "POST", corpo: pedido });
}
