const CHAVE_SEQUENCIA = "milebag.sequenciaLocal";

/**
 * Contador monotônico por dispositivo (HU08, FR-005) - é ele, e não o
 * relógio do aparelho, que define a ordem de sincronização: o relógio pode
 * atrasar, adiantar ou ser ajustado pelo próprio motorista, o que
 * embaralharia a ordem dos registros criados offline.
 */
export function proximaSequenciaLocal(): number {
  const atual = Number(localStorage.getItem(CHAVE_SEQUENCIA) ?? "0");
  const proxima = Number.isFinite(atual) ? atual + 1 : 1;
  localStorage.setItem(CHAVE_SEQUENCIA, String(proxima));
  return proxima;
}
