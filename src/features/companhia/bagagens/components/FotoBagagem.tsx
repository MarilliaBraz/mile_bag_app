import { useCallback } from "react";
import { useUrlDoArquivo } from "../hooks/useUrlDoArquivo";
import { baixarFoto } from "../services/bagagensService";
import type { BagagemEncontrada } from "../types";

/** Foto enviada pelo funcionário (HU34, HU35). */
export function FotoBagagem({ bagagem, alt }: { bagagem: BagagemEncontrada; alt: string }) {
  const url = useUrlDoArquivo(useCallback(() => baixarFoto(bagagem), [bagagem]));

  return url ? (
    <img className="foto-bagagem" src={url} alt={alt} />
  ) : (
    <div className="foto-bagagem foto-bagagem-vazia" aria-hidden="true" />
  );
}
