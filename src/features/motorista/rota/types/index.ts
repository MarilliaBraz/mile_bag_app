import type { Coordenada } from "../../../../shared/mapa/MapaBase";

export type { Coordenada };

/** Espelha com.marillia.milebag.core.geo.TipoSelecao. */
export type TipoSelecao = "SUGERIDA" | "PROPRIA";

/**
 * Espelha com.marillia.milebag.core.geo.RotaAlternativa. Sem traçado
 * (polilinha): o back-end extrai do motor de rotas apenas o resumo
 * (distância, tempo, indicador de pedágio), então o mapa só posiciona
 * origem e destino; as alternativas são comparadas pelos números.
 */
export type RotaAlternativa = {
  id: string;
  distanciaMetros: number;
  duracaoSegundos: number;
  possuiPedagio: boolean;
  /** Praças cadastradas (HU10) por onde o traçado passa (HU24); `valor` é o vigente por passagem, só para exibir. */
  pracasPedagio: PracaNaRota[];
};

/** Espelha com.marillia.milebag.core.geo.PracaNaRota. */
export type PracaNaRota = { pracaId: string; nome: string; valor: number | null };

/** Espelha com.marillia.milebag.business.rota.model.CalcularRotaResponse. */
export type CalculoRotas = {
  entregaId: string;
  origem: Coordenada;
  destino: Coordenada;
  alternativas: RotaAlternativa[];
};

/** Espelha com.marillia.milebag.business.rota.model.SelecionarRotaResponse. */
export type RotaSelecionada = {
  entregaId: string;
  tipoSelecao: TipoSelecao;
  rotaEscolhida: RotaAlternativa;
  justificativa: string | null;
};

/** Espelha com.marillia.milebag.business.viagem.model.TrajetoStatus. */
export type TrajetoStatus = "EM_EXECUCAO" | "ENCERRADO";

/** Espelha com.marillia.milebag.business.viagem.model.TipoCheckpoint. */
export type TipoCheckpoint = "PARTIDA" | "A_CAMINHO" | "CHEGADA" | "COMPROVANTE" | "OCORRENCIA";

/** Espelha com.marillia.milebag.business.viagem.model.TrechoPedagio. */
export type TrechoPedagio = {
  descricao: string;
  valorCadastrado: boolean;
  /** Trecho por praça (HU24): valor por passagem congelado quando o cálculo foi registrado. Sem `pracaId`, é só o indicador do motor de rotas. */
  pracaId?: string | null;
  valorUnitario?: number | null;
};

/** Espelha com.marillia.milebag.business.viagem.model.CheckpointResponse. */
export type Checkpoint = {
  id: string;
  tipo: TipoCheckpoint;
  lat: number | null;
  lng: number | null;
  dataHora: string;
  ausente: boolean;
};

/** Espelha com.marillia.milebag.business.viagem.model.CalculoRotaResponse. */
export type CalculoRota = {
  id: string;
  kmIda: string;
  kmVolta: string;
  pracasPedagio: TrechoPedagio[];
  tempoEstimado: number;
  origemSelecao: TipoSelecao;
  dataHora: string;
  ehRotaInicial: boolean;
};

/** Espelha com.marillia.milebag.business.viagem.model.TrajetoIniciadoResponse. */
export type TrajetoIniciado = {
  id: string;
  status: TrajetoStatus;
  dataInicio: string;
  calculoRotaInicial: CalculoRota;
  checkpointPartida: Checkpoint;
};

/** Espelha com.marillia.milebag.business.viagem.model.TrajetoDetalhadoResponse. */
export type TrajetoDetalhado = {
  id: string;
  status: TrajetoStatus;
  dataInicio: string;
  calculosRota: CalculoRota[];
  checkpoints: Checkpoint[];
  kmIdaFinal: string | null;
  kmVoltaFinal: string | null;
  pracasPedagioFinal: TrechoPedagio[] | null;
  tempoFinal: number | null;
  justificativaDivergencia: string | null;
};
