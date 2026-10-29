import type { BagagemEncontrada } from "../types";

/** Aeroporto do registro (RI21, RI22): o sugerido pela localização já escolhido, salvo se estiver longe. */
export const aeroportoInicial = (bagagem: BagagemEncontrada) =>
  bagagem.aeroporto && !bagagem.aeroporto.distante ? bagagem.aeroporto.codigo : "";
