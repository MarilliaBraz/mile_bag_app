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
};

/** Espelha ConfigPainelGestao (V61). */
export type ConfigPainelGestao = { prazoEntregaHoras: number; horasSemAtualizacao: number };
