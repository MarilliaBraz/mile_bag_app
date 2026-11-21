/** Espelha FinalidadeMotivo: ocorrência (não entrega), dispensa pelo motorista (V46) ou cancelamento do BDO pela empresa (V47) ou quem pode assinar o recebimento (V48). */
export type FinalidadeMotivo = "OCORRENCIA" | "DISPENSA" | "CANCELAMENTO" | "RECEBEDOR" | "CORRECAO";

/** Espelha MotivoOcorrenciaResponse - o GET só devolve os motivos ativos da finalidade pedida. */
export type MotivoOcorrencia = { id: string; descricao: string; reagendamento: boolean; finalidade: FinalidadeMotivo };

/** Espelha o enum CampoBaixa e CampoObrigatorioResponse. */
export type CampoBaixa =
  "POD_FOTO_DOCUMENTO" | "POD_IDENTIFICACAO_RECEBEDOR" | "POD_DATA_HORA" | "POD_GEOLOCALIZACAO" | "OCORRENCIA_DESCRICAO_ADICIONAL";

export type CampoObrigatorio = { campo: CampoBaixa; obrigatorio: boolean };

/** Espelha CodigoNomeResponse (base aeroportuária e companhia aérea têm o mesmo formato). */
export type CodigoNome = { id: string; codigoIata: string; nome: string };

export type CategoriaCodigoNome = "bases-aeroportuarias" | "companhias-aereas";

/** Espelha PeriodicidadeAtualResponse. */
export type PeriodicidadeAtual = { vigente: string; proxima: string | null; proximaVigenteDesde: string | null };
