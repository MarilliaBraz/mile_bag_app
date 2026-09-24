const REAL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarMoeda(valor: number | null | undefined): string {
  return valor === null || valor === undefined ? "—" : REAL.format(valor);
}

/** Datas ISO puras (AAAA-MM-DD) sem passar por Date, que as deslocaria pelo fuso. */
export function formatarData(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
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
