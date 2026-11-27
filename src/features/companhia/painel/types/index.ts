/** Espelha PainelCompanhiaResponse: o que ainda pede ação da companhia aérea. */
export type PainelCompanhia = { rascunhos: number; semEncaminhamento: number; emAndamento: number; naoEntregues: number };

/** Espelha PainelCompanhiaGestaoResponse.ItemAgir. */
export type ItemAgirCompanhia = {
  bagagemId: string;
  motivo: "ESTOURADO" | "NAO_ENTREGUE" | "ATENCAO" | "PARADA_NA_SALA";
  processo: string | null;
  passageiro: string | null;
  aeroporto: string | null;
  empresa: string | null;
  referencia: string | null;
};

/** Espelha PainelCompanhiaGestaoResponse (fase 1). Tempos em minutos; nulos sem dado. */
export type PainelCompanhiaGestao = {
  geradoEm: string;
  regulatorio: { noPrazo: number; atencao: number; estourados: number };
  tempos: { localizacaoMinutos: number | null; entregaMinutos: number | null; resolucao24h: number | null; entregues30Dias: number };
  custodia: { naSala: number; aguardandoColeta: number; emRota: number; entreguesHoje: number; naoEntregues: number };
  aeroportos: {
    codigo: string;
    naSala: number;
    aguardandoColeta: number;
    emRota: number;
    naoEntregues: number;
    estourados: number;
    entregaMinutos: number | null;
  }[];
  agirAgora: ItemAgirCompanhia[];
  /** Fase 2: SLA por transportadora e aeroporto, últimos 30 dias. */
  parceiros: {
    empresa: string;
    aeroporto: string;
    entregues: number;
    coletaMinutos: number | null;
    entregaMinutos: number | null;
    resolucao24h: number | null;
    naoEntregues: number;
    emAberto: number;
  }[];
  /** Fase 3: custos dos últimos 30 dias (valores em reais; nulos sem dado). */
  financeiro: {
    total: number;
    porTipo: Partial<Record<"FRETE" | "VOUCHER" | "REEMBOLSO_EMERGENCIAL" | "INDENIZACAO" | "OUTRO", number>>;
    processos: number;
    porProcesso: number | null;
    porProcessoAte24h: number | null;
    porProcessoAcima24h: number | null;
  };
  /** Fase 3: pesquisa de satisfação dos últimos 30 dias. */
  satisfacao: {
    respostas: number;
    nps: number | null;
    notaMedia: number | null;
    cordialidadeMedia: number | null;
    malasDanificadas: number;
  };
};
