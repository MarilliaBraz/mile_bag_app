/** Espelha com.marillia.milebag.business.dispensa.model.DispensaEntregaResponse (V46). */
export type Dispensa = {
  id: string;
  entregaId: string;
  motoristaNome: string | null;
  /** Nulo quando o motivo não era exigido (primeira tentativa, antes de retirar a bagagem). */
  motivo: string | null;
  complemento: string | null;
  /** O motorista já estava em rota com a bagagem: a viagem foi encerrada na dispensa. */
  comBagagem: boolean;
  dataHora: string;
};
