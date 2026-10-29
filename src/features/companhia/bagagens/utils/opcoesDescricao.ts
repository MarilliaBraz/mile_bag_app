import type { CorBagagem, SinalParticular, TamanhoBagagem, TipoVolume } from "../types";

/** Opções da descrição da bagagem sem etiqueta (HU35, RD20), na ordem em que aparecem na tela. */
export const CORES: readonly CorBagagem[] = [
  "PRETA",
  "CINZA",
  "BRANCA",
  "BEGE",
  "MARROM",
  "VERMELHA",
  "LARANJA",
  "AMARELA",
  "VERDE",
  "AZUL",
  "ROXA",
  "ROSA",
];
export const TIPOS_VOLUME: readonly TipoVolume[] = [
  "MALA_RIGIDA",
  "MALA_TECIDO",
  "MOCHILA",
  "BOLSA",
  "CAIXA",
  "INSTRUMENTO",
  "CARRINHO_BEBE",
  "OUTRO",
];
export const TAMANHOS: readonly TamanhoBagagem[] = ["P", "M", "G"];
export const SINAIS: readonly SinalParticular[] = ["FITA", "ADESIVO", "CADEADO", "AVARIA"];
