import type { SituacaoPagamento } from "../../fechamento/types";

/** Espelha PagamentoPendenteResponse: quinzena calculada de um motorista que ainda não foi paga. */
export type PagamentoPendente = {
  fechamentoId: string;
  periodoInicio: string;
  periodoFim: string;
  motoristaId: string;
  situacao: Exclude<SituacaoPagamento, "PAGO">;
  dataAgendada: string | null;
};

/** Espelha PainelGestaoResponse.ItemMala: uma mala numa lista do painel de gestão. */
export type ItemMala = {
  bdoId: string;
  entregaId: string | null;
  numero: string | null;
  passageiro: string | null;
  base: string | null;
  motorista: string | null;
  prazo: string | null;
  referencia: string | null;
  detalhe: string | null;
};

/** Espelha PainelGestaoResponse (fase 1): pulso da operação e exceções críticas. Contagens por BDO. */
export type PainelGestao = {
  geradoEm: string;
  prazoPadraoHoras: number;
  horasSemAtualizacao: number;
  /** Meta de entregas no prazo (OTD), em %. */
  metaOtd: number;
  radar: { noPrazo: number; alerta: ItemMala[]; atrasadas: ItemMala[] };
  funil: { aguardandoColeta: number; emTransito: number; entreguesHoje: number; comOcorrencia: number };
  otd: { hoje: number | null; trintaDias: number | null; entreguesHoje: number; entregues30Dias: number };
  ciclo: { minutosHoje: number | null; minutos30Dias: number | null };
  excecoes: {
    tentativasFrustradas: ItemMala[];
    paradas: ItemMala[];
    evidenciasPendentes: ItemMala[];
    avarias: { naRetirada: number; naEntrega: number; entregues30Dias: number; itens: ItemMala[] };
  };
  /** Últimos 30 dias, do mais antigo a hoje (horário de Brasília). */
  serie: DiaOperacao[];
};

/** Espelha PainelGestaoResponse.DiaOperacao. */
export type DiaOperacao = { dia: string; entregues: number; otd: number | null; cicloMinutos: number | null };

/** Espelha ConfigPainelGestao (V61). */
export type ConfigPainelGestao = { prazoEntregaHoras: number; horasSemAtualizacao: number; metaOtd: number };

export type SituacaoBase = "NORMAL" | "RETENCAO" | "CRITICO";
export type SituacaoRota = "NORMAL" | "PARADO" | "SEM_SINAL" | "DESVIO";

/** Espelha PainelGeograficoResponse.BaseOperacao. */
export type BaseOperacao = {
  codigo: string;
  nome: string | null;
  cidade: string | null;
  latitude: number | null;
  longitude: number | null;
  situacao: SituacaoBase;
  aguardandoColeta: number;
  retidas: number;
  esperaMediaMinutos: number | null;
  maiorEsperaMinutos: number | null;
  emAlerta: number;
  atrasadas: number;
  retiradasHoje: number;
  coletaMediaHojeMinutos: number | null;
};

/** Espelha PainelGeograficoResponse.RotaAtiva. */
export type RotaAtiva = {
  trajetoId: string;
  entregaId: string;
  numero: string | null;
  motorista: string | null;
  base: string | null;
  destino: string | null;
  inicio: string;
  kmPrevistos: number | null;
  pedagio: boolean;
  pracas: number;
  entregue: boolean;
  kmPercorridos: number;
  ultimaPosicao: string | null;
  latitude: number | null;
  longitude: number | null;
  longa: boolean;
  situacao: SituacaoRota;
};

/** Espelha PainelGeograficoResponse (fase 2). */
export type PainelGeografico = { geradoEm: string; bases: BaseOperacao[]; ranking: BaseOperacao[]; rotas: RotaAtiva[] };

/** Espelha PainelFrotaResponse.Custo: custo das viagens encerradas no período sobre as malas entregues. */
export type CustoPeriodo = {
  total: number;
  pagamentoMotoristas: number;
  pedagios: number;
  viagens: number;
  viagensSemValor: number;
  malasEntregues: number;
  porMala: number | null;
  km: number;
  porKm: number | null;
};

export type SituacaoMotorista = "EM_ROTA" | "DISPONIVEL" | "OFFLINE";

export type MotoristaStatus = {
  id: string;
  nome: string | null;
  base: string | null;
  situacao: SituacaoMotorista;
  ultimoAcesso: string | null;
  entregas: number;
  pontualidade: number | null;
  primeiraTentativa: number | null;
  malasPorSaida: number | null;
};

/** Espelha PainelFrotaResponse (fase 3). */
export type PainelFrota = {
  geradoEm: string;
  custoHoje: CustoPeriodo;
  custo30Dias: CustoPeriodo;
  ocupacao30Dias: { saidas: number; malasPorSaida: number | null; saidasComUmaMala: number };
  pracas: { base: string; emRota: number; disponiveis: number; offline: number }[];
  motoristas: MotoristaStatus[];
  /** Últimos 30 dias, do mais antigo a hoje. */
  serie: { dia: string; custoPorMala: number | null; malasPorSaida: number | null }[];
};

/** Abre a gaveta com a lista de malas de um número do painel. */
export type AbrirLista = (titulo: string, itens: ItemMala[], mostrar: "prazo" | "referencia") => void;
