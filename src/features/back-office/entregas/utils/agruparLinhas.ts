import type { EntregaGestao } from "../types";

/** Como a grid de entregas é agrupada; "" = sem agrupamento (uma lista só). */
export type Agrupamento = "" | "motorista" | "status" | "base";

export const AGRUPAMENTOS: Agrupamento[] = ["", "motorista", "status", "base"];

export type GrupoLinhas = { chave: string; linhas: EntregaGestao[] };

const CHAVE_DO_GRUPO: Record<Exclude<Agrupamento, "">, (linha: EntregaGestao) => string> = {
  motorista: (linha) => linha.motoristaNome ?? "",
  status: (linha) => linha.status,
  base: (linha) => linha.baseCodigo ?? "",
};

/**
 * Separa as linhas em grupos, na ordem em que cada grupo aparece pela primeira vez: como a lista já vem com os
 * pendentes no topo, o grupo deles vem primeiro. Dentro do grupo, a ordem da lista é mantida.
 */
export function agruparLinhas(linhas: EntregaGestao[], por: Agrupamento): GrupoLinhas[] {
  if (!por) {
    return [{ chave: "", linhas }];
  }
  const grupos = new Map<string, EntregaGestao[]>();
  for (const linha of linhas) {
    const chave = CHAVE_DO_GRUPO[por](linha);
    grupos.set(chave, [...(grupos.get(chave) ?? []), linha]);
  }
  return [...grupos].map(([chave, doGrupo]) => ({ chave, linhas: doGrupo }));
}

/** Número do BDO sem espaços, traços nem diferença de maiúsculas: "gyn la-25537" acha "GYNLA25537". */
const normalizarNumero = (texto: string) => texto.toUpperCase().replace(/[^A-Z0-9]/g, "");

export function filtrarPorNumero(linhas: EntregaGestao[], busca: string): EntregaGestao[] {
  const alvo = normalizarNumero(busca);
  return alvo ? linhas.filter((linha) => normalizarNumero(linha.bdoNumero ?? "").includes(alvo)) : linhas;
}
