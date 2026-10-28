/** Espelha com.marillia.milebag.business.sincronizacao.model.TipoEventoSincronizacao. */
export type TipoEventoSincronizacao =
  | "BDO_CAPTURADO"
  | "ENTREGA_AUTOATRIBUIDA"
  | "ROTA_ESCOLHIDA"
  | "VIAGEM_INICIADA"
  | "BAGAGEM_CARONA_VINCULADA"
  | "COMPROVANTE_REGISTRADO"
  | "OCORRENCIA_REGISTRADA";

export type StatusRegistro = "PENDENTE" | "ERRO" | "SINCRONIZADO";

/**
 * Registro criado no dispositivo e ainda não confirmado pelo servidor
 * (HU08, `data-model.md`). Fica no IndexedDB até a sincronização ser
 * confirmada (FR-007) - nunca é descartado por falha de envio.
 */
export type RegistroPendente = {
  idLocal: string;
  /** Contador monotônico do dispositivo, não o relógio: preserva a ordem de criação na sincronização (FR-005). */
  sequenciaLocal: number;
  tipoEvento: TipoEventoSincronizacao;
  payload: unknown;
  timestampCriacaoLocal: string;
  status: StatusRegistro;
  tentativas: number;
  /** Motivo devolvido pelo servidor no último `resultado: ERRO`, para o motorista saber o que travou. */
  motivo?: string | null;
};
