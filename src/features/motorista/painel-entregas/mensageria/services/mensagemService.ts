import { requisitar } from "../../../../../shared/services/httpClient";
import type { Conversa, Mensagem } from "../types";

/** GET /api/v1/entregas/{entregaId}/mensagens (HU18, FR-001) - linha do tempo única, mais antiga primeiro. */
export function consultarConversa(entregaId: string): Promise<Conversa> {
  return requisitar<Conversa>(`/api/v1/entregas/${entregaId}/mensagens`);
}

/** POST /api/v1/entregas/{entregaId}/mensagens (HU18, FR-002) - o canal é escolhido pelo servidor (FR-003). */
export function enviarMensagem(entregaId: string, conteudo: string): Promise<Mensagem> {
  return requisitar<Mensagem>(`/api/v1/entregas/${entregaId}/mensagens`, { metodo: "POST", corpo: { conteudo } });
}
