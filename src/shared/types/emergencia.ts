/** Espelha com.marillia.milebag.business.emergencia.model.StatusAlertaEmergencia. */
export type StatusAlertaEmergencia = "ABERTO" | "CANCELADO" | "ATENDIDO";

/** Espelha com.marillia.milebag.business.emergencia.model.AlertaEmergenciaResponse. */
export type AlertaEmergencia = {
  id: string;
  motoristaId: string;
  motoristaNome: string;
  entregaId: string | null;
  latitude: number | null;
  longitude: number | null;
  dataHora: string;
  status: StatusAlertaEmergencia;
  observacao: string | null;
  encerradoEm: string | null;
  novo: boolean;
};
