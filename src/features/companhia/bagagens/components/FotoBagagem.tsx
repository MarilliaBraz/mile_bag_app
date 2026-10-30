import { useEffect, useState } from "react";
import { baixarFoto } from "../services/bagagensService";
import type { BagagemEncontrada } from "../types";

/** Foto enviada pelo funcionário: baixada com o token e mostrada por uma URL local, liberada ao sair da tela. */
export function FotoBagagem({ bagagem, alt }: { bagagem: BagagemEncontrada; alt: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let local: string | null = null;
    let ativo = true;
    baixarFoto(bagagem)
      .then((arquivo) => {
        if (ativo) {
          local = URL.createObjectURL(arquivo);
          setUrl(local);
        }
      })
      .catch(() => undefined);
    return () => {
      ativo = false;
      if (local) {
        URL.revokeObjectURL(local);
      }
    };
  }, [bagagem]);

  return url ? (
    <img className="foto-bagagem" src={url} alt={alt} />
  ) : (
    <div className="foto-bagagem foto-bagagem-vazia" aria-hidden="true" />
  );
}
