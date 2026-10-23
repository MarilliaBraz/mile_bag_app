import { requisitar } from "../../../../shared/api/httpClient";

/** Espelha os enums de com.marillia.milebag.business.mensagem.model. */
export type AutorMensagem = "MOTORISTA" | "PASSAGEIRO" | "SISTEMA";
export type CanalMensagem = "TELEGRAM" | "EMAIL";
export type StatusEnvio = "ENVIADA" | "FALHOU" | "RECEBIDA";
export type TipoEventoNotificacao = "VIAGEM_INICIADA" | "A_CAMINHO" | "CHEGADA" | "COMPROVANTE_REGISTRADO" | "OCORRENCIA_REGISTRADA";

/** Espelha com.marillia.milebag.business.mensagem.model.MensagemResponse. */
export type Mensagem = {
  id: string;
  autor: AutorMensagem;
  canal: CanalMensagem;
  tipo: "MANUAL" | "AUTOMATICA";
  conteudo: string;
  statusEnvio: StatusEnvio;
  criadoEm: string;
  tipoEvento: TipoEventoNotificacao | null;
};

/** Espelha com.marillia.milebag.business.mensagem.model.ConversaResponse. */
export type Conversa = {
  contatoDisponivel: { telegram: boolean; email: boolean };
  mensagens: Mensagem[];
};

/** GET /api/v1/entregas/{entregaId}/mensagens (HU18, FR-001) - linha do tempo única, mais antiga primeiro. */
export function consultarConversa(entregaId: string): Promise<Conversa> {
  return requisitar<Conversa>(`/api/v1/entregas/${entregaId}/mensagens`);
}

/** POST /api/v1/entregas/{entregaId}/mensagens (HU18, FR-002) - o canal é escolhido pelo servidor (FR-003). */
export function enviarMensagem(entregaId: string, conteudo: string): Promise<Mensagem> {
  return requisitar<Mensagem>(`/api/v1/entregas/${entregaId}/mensagens`, { metodo: "POST", corpo: { conteudo } });
}
