import type { FiltrosConsulta } from "../types";

/** Os filtros da consulta (HU36), na ordem do formulário; ficam na URL para a ficha voltar à mesma busca. */
export const CAMPOS_FILTRO = ["texto", "aeroporto", "de", "ate", "tipo", "tipoVolume", "cor", "situacao"] as const;

export function filtrosDaUrl(parametros: URLSearchParams): FiltrosConsulta {
  const filtros: FiltrosConsulta = {};
  for (const campo of CAMPOS_FILTRO) {
    const valor = parametros.get(campo)?.trim();
    if (valor) filtros[campo] = valor;
  }
  return filtros;
}

/** Query string da API: só os filtros preenchidos e, se houver, a página. */
export function consultaQuery(filtros: FiltrosConsulta, pagina?: number): string {
  const parametros = new URLSearchParams();
  for (const campo of CAMPOS_FILTRO) {
    const valor = filtros[campo];
    if (valor) parametros.set(campo, valor);
  }
  if (pagina) parametros.set("pagina", String(pagina));
  return parametros.toString();
}

/** RD20: 10 dígitos do código de barras ou a placa (2 posições da companhia e 6 dígitos); espaços não contam. */
export const normalizarEtiqueta = (valor: string) => valor.replace(/\s+/g, "").toUpperCase();
export const etiquetaValida = (numero: string) => /^(\d{10}|([A-Z]{2}|[A-Z]\d|\d[A-Z])\d{6})$/.test(numero);
