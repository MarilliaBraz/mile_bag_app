const REAL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarMoeda(valor: number | null | undefined): string {
  return valor === null || valor === undefined ? "Sem valor" : REAL.format(valor);
}

/** Datas ISO puras (AAAA-MM-DD) sem passar por Date, que as deslocaria pelo fuso. */
export function formatarData(iso: string | null | undefined): string {
  if (!iso) {
    return "Sem data";
  }
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
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

const DIA = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
const HORA = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

/** "qui., 23/10, 14:00 às 16:00" - no fuso do aparelho, que é o do motorista em campo. */
export function formatarJanela(janela: JanelaReagendamento): string {
  const inicio = new Date(janela.inicio);
  const fim = new Date(janela.fim);
  const mesmoDia = inicio.toDateString() === fim.toDateString();
  return mesmoDia
    ? `${DIA.format(inicio)}, ${HORA.format(inicio)} às ${HORA.format(fim)}`
    : `${DIA.format(inicio)} ${HORA.format(inicio)} até ${DIA.format(fim)} ${HORA.format(fim)}`;
}
