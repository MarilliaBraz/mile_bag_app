import type { AlertaEmergencia } from "../../../../shared/types/emergencia";
import { formatarData } from "../../../../shared/utils/formatar";
import type { Textos } from "../../../../shared/utils/i18n/textos/pt";
import type { EntregaGestao } from "../../entregas/types";
import { minutosParaVencer } from "../../entregas/utils/prioridadeBdo";
import type { Fechamento } from "../../fechamento/types";
import type { PagamentoPendente, PainelGeografico, PainelGestao } from "../types";

export type Tarefa = { chave: string; texto: string; para: string; urgente: boolean };

export type DadosPainel = {
  alertas: AlertaEmergencia[];
  entregas: EntregaGestao[];
  fechamentos: Fechamento[];
  pagamentos: PagamentoPendente[];
  /** Painel de gestão (fase 1); nulo até a primeira leitura dar certo. */
  gestao: PainelGestao | null;
  /** Fase 2: bases e rotas; nulo até a primeira leitura dar certo. */
  geografico: PainelGeografico | null;
};

/** Situações em que o BDO já está com um motorista e a entrega segue. */
export const STATUS_EM_ANDAMENTO = new Set(["ATRIBUIDA", "EM_ANDAMENTO"]);

/** Agendado para hoje (ou antes) e ainda não pago. */
export const pagamentoVencido = (pagamento: PagamentoPendente, hoje: string) =>
  pagamento.situacao === "AGENDADO" && pagamento.dataAgendada !== null && pagamento.dataAgendada <= hoje;

/** BDOs além do prazo de 1h, o mais atrasado primeiro, com os minutos de atraso. */
export function bdosAtrasados(entregas: EntregaGestao[], agora: number) {
  return entregas
    .map((entrega) => ({ entrega, minutos: minutosParaVencer(entrega, agora) }))
    .filter((item): item is { entrega: EntregaGestao; minutos: number } => item.minutos !== null && item.minutos <= 0)
    .sort((a, b) => a.minutos - b.minutos);
}

/**
 * Lista "A fazer" da empresa, da mais urgente para a menos: emergências, BDOs sem motorista além do prazo,
 * pagamentos vencidos, quinzenas com pendência e pagamentos ainda por agendar.
 */
export function tarefasEmpresa(
  dados: DadosPainel,
  agora: number,
  hoje: string,
  nomeMotorista: (id: string) => string,
  t: Textos["backOffice"]["painel"],
): Tarefa[] {
  const periodo = (inicio: string, fim: string) => t.periodo(formatarData(inicio), formatarData(fim));
  const doFechamento = (id: string) => `/admin/fechamentos/${id}`;
  return [
    ...dados.alertas.map((alerta) => ({
      chave: `alerta-${alerta.id}`,
      texto: t.tarefaEmergencia(alerta.motoristaNome),
      para: "/admin/emergencias",
      urgente: true,
    })),
    ...bdosAtrasados(dados.entregas, agora).map(({ entrega, minutos }) => ({
      chave: `bdo-${entrega.bdoId}`,
      texto: t.tarefaBdo(entrega.bdoNumero ?? "–", -minutos),
      para: "/admin/entregas",
      urgente: true,
    })),
    ...dados.pagamentos
      .filter((pagamento) => pagamentoVencido(pagamento, hoje))
      .map((pagamento) => ({
        chave: `pagar-${pagamento.fechamentoId}-${pagamento.motoristaId}`,
        texto: t.tarefaPagar(nomeMotorista(pagamento.motoristaId), formatarData(pagamento.dataAgendada)),
        para: doFechamento(pagamento.fechamentoId),
        urgente: false,
      })),
    ...dados.fechamentos
      .filter((fechamento) => fechamento.status === "COM_PENDENCIAS")
      .map((fechamento) => ({
        chave: `fechamento-${fechamento.id}`,
        texto: t.tarefaFechamento(periodo(fechamento.periodoInicio, fechamento.periodoFim)),
        para: doFechamento(fechamento.id),
        urgente: false,
      })),
    ...dados.pagamentos
      .filter((pagamento) => pagamento.situacao === "A_AGENDAR")
      .map((pagamento) => ({
        chave: `agendar-${pagamento.fechamentoId}-${pagamento.motoristaId}`,
        texto: t.tarefaAgendar(nomeMotorista(pagamento.motoristaId), periodo(pagamento.periodoInicio, pagamento.periodoFim)),
        para: doFechamento(pagamento.fechamentoId),
        urgente: false,
      })),
  ];
}
