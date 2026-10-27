import { localeAtual, obterTextos } from "../i18n/idioma";

// Os formatadores do Intl são caros de criar: um por idioma e formato, reaproveitado entre chamadas.
const formatadores = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>();

function numero(opcoes: Intl.NumberFormatOptions): Intl.NumberFormat {
  const chave = `n|${localeAtual()}|${JSON.stringify(opcoes)}`;
  if (!formatadores.has(chave)) {
    formatadores.set(chave, new Intl.NumberFormat(localeAtual(), opcoes));
  }
  return formatadores.get(chave) as Intl.NumberFormat;
}

function data(opcoes: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const chave = `d|${localeAtual()}|${JSON.stringify(opcoes)}`;
  if (!formatadores.has(chave)) {
    formatadores.set(chave, new Intl.DateTimeFormat(localeAtual(), opcoes));
  }
  return formatadores.get(chave) as Intl.DateTimeFormat;
}

/**
 * Valores em reais em qualquer idioma: muda só a escrita (R$ 1.234,56, R$1,234.56, 1234,56 R$). O símbolo
 * "estreito" porque o espanhol, sem símbolo próprio para o real, escreveria "BRL".
 */
export function formatarMoeda(valor: number | null | undefined): string {
  return valor === null || valor === undefined
    ? obterTextos().comum.semValor
    : numero({ style: "currency", currency: "BRL", currencyDisplay: "narrowSymbol" }).format(valor);
}

/** Número com casas decimais fixas (km, litros) ou inteiro com separador de milhar. */
export function formatarNumero(valor: number, casas = 0): string {
  return numero({ minimumFractionDigits: casas, maximumFractionDigits: casas }).format(valor);
}

/** Datas ISO puras (AAAA-MM-DD) formatadas em UTC, porque no fuso do aparelho mudariam de dia. */
export function formatarData(iso: string | null | undefined): string {
  if (!iso) {
    return obterTextos().comum.semData;
  }
  const [ano, mes, dia] = iso.slice(0, 10).split("-").map(Number);
  return data({ day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(ano, mes - 1, dia)));
}

/** Instante (ISO com hora) em data e hora curtas, no fuso do aparelho. */
export function formatarDataHora(instante: string | number | Date): string {
  return data({ dateStyle: "short", timeStyle: "short" }).format(new Date(instante));
}

/** Só a hora (HH:MM) de um instante, no fuso do aparelho. */
export function formatarHora(instante: string | number | Date): string {
  return data({ hour: "2-digit", minute: "2-digit" }).format(new Date(instante));
}

export function hojeIso(): string {
  const agora = new Date();
  const dois = (n: number) => String(n).padStart(2, "0");
  return `${agora.getFullYear()}-${dois(agora.getMonth() + 1)}-${dois(agora.getDate())}`;
}

export function mensagemDeErro(excecao: unknown, padrao: string): string {
  return excecao instanceof Error && excecao.message ? excecao.message : padrao;
}

/** Espelha com.marillia.milebag.business.entrega.model.JanelaReagendamento (mile_bag_api) - instantes ISO. */
export type JanelaReagendamento = { inicio: string; fim: string };

/** "qui., 23/10, 14:00 às 16:00" - no fuso do aparelho, que é o do motorista em campo. */
export function formatarJanela(janela: JanelaReagendamento): string {
  const t = obterTextos().formato;
  const dia = data({ weekday: "short", day: "2-digit", month: "2-digit" });
  const inicio = new Date(janela.inicio);
  const fim = new Date(janela.fim);
  const mesmoDia = inicio.toDateString() === fim.toDateString();
  return mesmoDia
    ? t.janelaMesmoDia(dia.format(inicio), formatarHora(inicio), formatarHora(fim))
    : t.janelaDiasDiferentes(dia.format(inicio), formatarHora(inicio), dia.format(fim), formatarHora(fim));
}
