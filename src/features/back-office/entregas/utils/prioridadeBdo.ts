import type { EntregaGestao } from "../types";

/** Prazo para um motorista assumir o BDO depois de registrado; passado ele, o BDO vira pendência. Fixo por enquanto. */
export const PRAZO_ASSUMIR_MS = 60 * 60 * 1000;

const MINUTO_MS = 60_000;

/** BDO que espera um motorista. A carona não conta: ela vai junto com a entrega principal. */
function aguardaMotorista(linha: EntregaGestao): boolean {
  return linha.status === "AGUARDANDO_ATRIBUICAO" && !linha.motoristaNome && !linha.bagagemCarona;
}

/**
 * Minutos que faltam para vencer o prazo (negativo = minutos de atraso), ou null quando o BDO não espera motorista.
 * Para o BDO sem motorista, `atualizadoEm` é a hora em que ele foi registrado.
 */
export function minutosParaVencer(linha: EntregaGestao, agora: number): number | null {
  const registradoEm = Date.parse(linha.atualizadoEm);
  if (!aguardaMotorista(linha) || Number.isNaN(registradoEm)) {
    return null;
  }
  return Math.ceil((registradoEm + PRAZO_ASSUMIR_MS - agora) / MINUTO_MS);
}

export function estaPendente(linha: EntregaGestao, agora: number): boolean {
  const minutos = minutosParaVencer(linha, agora);
  return minutos !== null && minutos <= 0;
}

/** Pendentes primeiro (o mais atrasado no topo); o resto mantém a ordem que veio. */
export function priorizarPendentes(linhas: EntregaGestao[], agora: number): EntregaGestao[] {
  const pendentes = linhas
    .filter((linha) => estaPendente(linha, agora))
    .sort((a, b) => Date.parse(a.atualizadoEm) - Date.parse(b.atualizadoEm));
  return [...pendentes, ...linhas.filter((linha) => !estaPendente(linha, agora))];
}
