/** Espelha com.marillia.milebag.business.configuracao.model.MotivoOcorrenciaResponse (só motivos ativos). */
export type MotivoOcorrencia = {
  id: string;
  descricao: string;
  /** HU29: pede a janela combinada. Ausente no cache salvo antes do campo existir (= falso). */
  reagendamento?: boolean;
};

/** Espelha com.marillia.milebag.business.ocorrencia.model.OcorrenciaResponse. */
export type OcorrenciaResponse = {
  id: string;
  entregaId: string;
  motivoOcorrenciaId: string;
  dataHora: string;
  entregaStatus: string;
  janelaInicio: string | null;
  janelaFim: string | null;
};
