import type { ItemPainelDetalhe } from "../types";

/** Uma linha do quadro "confira as malas": o BDO, quantas malas ele tem (nulo se não informa) e se é carona. */
export type MalasDoBdo = { bdoNumero: string | null; quantidade: number | null; carona: boolean };

/** Item 8: as malas da entrega e das caronas, e o total quando todos os BDOs informam a quantidade. */
export function malasParaConferir(entrega: ItemPainelDetalhe): { linhas: MalasDoBdo[]; total: number | null } {
  const linhas: MalasDoBdo[] = [
    { bdoNumero: entrega.bdoNumero, quantidade: entrega.quantidadeMalas ?? null, carona: false },
    ...entrega.bagagensCarona.map((carona) => ({
      bdoNumero: carona.bdoNumero ?? null,
      quantidade: carona.quantidadeMalas ?? null,
      carona: true,
    })),
  ];
  const informadas = linhas.every((linha) => linha.quantidade != null);
  const total = informadas ? linhas.reduce((soma, linha) => soma + (linha.quantidade ?? 0), 0) : null;
  return { linhas, total };
}
