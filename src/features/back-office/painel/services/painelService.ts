import { requisitar } from "../../../../shared/services/httpClient";
import type { ConfigPainelGestao, PagamentoPendente, PainelFrota, PainelGeografico, PainelGestao } from "../types";

/** Motoristas com quinzena calculada ainda não paga, de todos os fechamentos (agendados primeiro). */
export const listarPagamentosPendentes = () => requisitar<PagamentoPendente[]>("/api/v1/fechamentos/pagamentos-pendentes");

/** Painel de gestão (fase 1): radar de SLA, funil do dia, OTD, tempo de ciclo e exceções críticas. */
export const obterPainelGestao = () => requisitar<PainelGestao>("/api/v1/gestao/painel");

export const obterConfigPainelGestao = () => requisitar<ConfigPainelGestao>("/api/v1/configuracoes/painel-gestao");
export const salvarConfigPainelGestao = (corpo: ConfigPainelGestao) =>
  requisitar<ConfigPainelGestao>("/api/v1/configuracoes/painel-gestao", { metodo: "PUT", corpo });

/** Fase 2: situação de cada base, as 5 piores do dia e as viagens em andamento. */
export const obterPainelGeografico = () => requisitar<PainelGeografico>("/api/v1/gestao/painel/geografico");

/** Fase 3: custo por mala, ocupação das saídas e situação dos motoristas. */
export const obterPainelFrota = () => requisitar<PainelFrota>("/api/v1/gestao/painel/frota");
