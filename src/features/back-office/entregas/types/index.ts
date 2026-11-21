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
  /** V51: o motorista corrigiu alguma etapa (selo "Corrigida"; o detalhe está no histórico). */
  corrigida: boolean;
  /** V52: código IATA da base do BDO (quem pode assumir). */
  baseCodigo: string | null;
};

export type TipoEventoRastreabilidade =
  | "BDO_RECEBIDO"
  | "BAGAGEM_RETIRADA"
  | "VIAGEM_INICIADA"
  | "OCORRENCIA"
  | "DISPENSA_SEM_BAGAGEM"
  | "DISPENSA_COM_BAGAGEM"
  | "ENTREGUE"
  | "CANCELADO"
  /** V50: segunda via enviada por e-mail; `descricao` é o endereço de destino. */
  | "SEGUNDA_VIA_ENVIADA"
  /** V51: etapa corrigida pelo motorista; `descricao` é a etapa (FOTO_PORTA...), `detalhe` o motivo, antes e depois. */
  | "CORRECAO"
  /** V52: a empresa trocou a base do BDO; `descricao` "GYN -> BSB", `detalhe` o motivo. */
  | "BASE_ALTERADA";

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

/** Espelha FotoGestaoResponse (V48): o arquivo vem de .../fotos/{id}. */
export type FotoEntrega = {
  id: string;
  tipo: "RETIRADA" | "AVARIA_RETIRADA" | "PORTA" | "AVARIA_ENTREGA" | "BDO_ASSINADO";
  dataHora: string;
  /** V51: trocada por uma correção - continua guardada para auditoria. */
  substituida: boolean;
};
