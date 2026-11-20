import type { EntregaStatus } from "../../../motorista/painel-entregas/types";

/**
 * Espelha com.marillia.milebag.business.rastreabilidade.model.EntregaGestaoResponse (V46). V47: também o BDO que
 * ninguém assumiu - `entregaId` nulo e status AGUARDANDO_ATRIBUICAO -, para a empresa poder cancelá-lo.
 */
export type EntregaGestao = {
  entregaId: string | null;
  bdoId: string;
  /** O BDO viaja junto de outra entrega (bagagem carona). */
  bagagemCarona: boolean;
  status: EntregaStatus;
  bdoNumero: string | null;
  passageiroNome: string | null;
  endereco: string | null;
  motoristaNome: string | null;
  atualizadoEm: string;
};

export type TipoEventoRastreabilidade =
  "BDO_RECEBIDO" | "VIAGEM_INICIADA" | "OCORRENCIA" | "DISPENSA_SEM_BAGAGEM" | "DISPENSA_COM_BAGAGEM" | "ENTREGUE" | "CANCELADO";

/** Espelha EventoRastreabilidade: um fato da vida da mala, na ordem em que aconteceu. */
export type EventoRastreabilidade = {
  tipo: TipoEventoRastreabilidade;
  dataHora: string | null;
  motoristaNome: string | null;
  descricao: string | null;
  detalhe: string | null;
};

/** Espelha HistoricoEntregaResponse. */
export type HistoricoEntrega = {
  entrega: EntregaGestao;
  eventos: EventoRastreabilidade[];
};
