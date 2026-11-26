import type { AlertaEmergencia } from "../../../../shared/types/emergencia";
import type { EntregaGestao } from "../../entregas/types";
import type { ItemMala, PainelGeografico, PainelGestao } from "../types";
import { bdosAtrasados } from "./tarefasEmpresa";

export type Comparacao = { tipo: "melhor" | "pior" | "igual" | "sem"; diferenca: number };

/** Hoje contra a média de 30 dias. `menorMelhor`: tempo e custo melhoram quando caem. Diferença sempre positiva. */
export function comparar(hoje: number | null, media: number | null, menorMelhor: boolean): Comparacao {
  if (hoje === null || media === null) {
    return { tipo: "sem", diferenca: 0 };
  }
  const diferenca = Math.abs(hoje - media);
  if (diferenca < 0.005) {
    return { tipo: "igual", diferenca: 0 };
  }
  const caiu = hoje < media;
  return { tipo: caiu === menorMelhor ? "melhor" : "pior", diferenca };
}

/** Motivo da lista "Agir agora", na ordem de urgência. */
export type MotivoAgir =
  "EMERGENCIA" | "ATRASADA" | "SEM_MOTORISTA" | "SEM_SINAL" | "DESVIO" | "PARADA" | "EM_ALERTA" | "TENTATIVA" | "EVIDENCIA";

export type ItemAgir = {
  chave: string;
  motivo: MotivoAgir;
  /** Vermelho (urgente) ou âmbar (atenção). */
  urgente: boolean;
  numero: string | null;
  base: string | null;
  /** Minutos de atraso (positivo) ou que faltam (negativo), quando o motivo tem prazo. */
  minutos: number | null;
  detalhe: string | null;
  para: string;
};

const ORDEM: MotivoAgir[] = [
  "EMERGENCIA",
  "ATRASADA",
  "SEM_MOTORISTA",
  "SEM_SINAL",
  "DESVIO",
  "PARADA",
  "EM_ALERTA",
  "TENTATIVA",
  "EVIDENCIA",
];
const URGENTES = new Set<MotivoAgir>(["EMERGENCIA", "ATRASADA", "SEM_MOTORISTA", "SEM_SINAL", "DESVIO", "PARADA"]);

const paraEntrega = (numero: string | null) => `/admin/entregas?busca=${encodeURIComponent(numero ?? "")}`;
const minutosDesde = (iso: string | null, agora: number) => (iso ? Math.round((agora - Date.parse(iso)) / 60_000) : null);

/**
 * Junta as exceções de todas as fontes numa lista só, a mais urgente primeiro, sem repetir a mesma mala (fica o
 * motivo mais grave). Emergências vêm antes de tudo.
 */
export function itensAgirAgora(
  gestao: PainelGestao | null,
  geografico: PainelGeografico | null,
  alertas: AlertaEmergencia[],
  entregas: EntregaGestao[],
  agora: number,
): ItemAgir[] {
  const item = (motivo: MotivoAgir, mala: ItemMala, minutos: number | null, detalhe: string | null = mala.detalhe): ItemAgir => ({
    chave: `${motivo}-${mala.bdoId}`,
    motivo,
    urgente: URGENTES.has(motivo),
    numero: mala.numero,
    base: mala.base,
    minutos,
    detalhe,
    para: paraEntrega(mala.numero),
  });
  const todos: ItemAgir[] = [
    ...alertas.map((alerta) => ({
      chave: `EMERGENCIA-${alerta.id}`,
      motivo: "EMERGENCIA" as const,
      urgente: true,
      numero: null,
      base: null,
      minutos: minutosDesde(alerta.dataHora, agora),
      detalhe: alerta.motoristaNome,
      para: "/admin/emergencias",
    })),
    ...(gestao?.radar.atrasadas ?? []).map((mala) => item("ATRASADA", mala, minutosDesde(mala.prazo, agora), mala.motorista)),
    ...bdosAtrasados(entregas, agora).map(({ entrega, minutos }) => ({
      chave: `SEM_MOTORISTA-${entrega.bdoId}`,
      motivo: "SEM_MOTORISTA" as const,
      urgente: true,
      numero: entrega.bdoNumero,
      base: entrega.baseCodigo,
      minutos: -minutos,
      detalhe: entrega.passageiroNome,
      para: paraEntrega(entrega.bdoNumero),
    })),
    ...(geografico?.rotas ?? [])
      .filter((rota) => rota.situacao === "SEM_SINAL" || rota.situacao === "DESVIO")
      .map((rota) => ({
        chave: `${rota.situacao}-${rota.trajetoId}`,
        motivo: rota.situacao as MotivoAgir,
        urgente: true,
        numero: rota.numero,
        base: rota.base,
        minutos: rota.situacao === "SEM_SINAL" ? minutosDesde(rota.ultimaPosicao, agora) : null,
        detalhe: [rota.motorista, rota.destino].filter(Boolean).join(" · ") || null,
        para: paraEntrega(rota.numero),
      })),
    ...(gestao?.excecoes.paradas ?? []).map((mala) => item("PARADA", mala, minutosDesde(mala.referencia, agora), mala.motorista)),
    ...(gestao?.radar.alerta ?? []).map((mala) => item("EM_ALERTA", mala, minutosDesde(mala.prazo, agora))),
    ...(gestao?.excecoes.tentativasFrustradas ?? []).map((mala) => item("TENTATIVA", mala, null)),
    ...(gestao?.excecoes.evidenciasPendentes ?? []).map((mala) => item("EVIDENCIA", mala, null)),
  ];
  const vistos = new Set<string>();
  return todos
    .sort((a, b) => ORDEM.indexOf(a.motivo) - ORDEM.indexOf(b.motivo) || (b.minutos ?? 0) - (a.minutos ?? 0))
    .filter((it) => {
      const mala = it.numero ?? it.chave;
      if (vistos.has(mala)) return false;
      vistos.add(mala);
      return true;
    });
}
