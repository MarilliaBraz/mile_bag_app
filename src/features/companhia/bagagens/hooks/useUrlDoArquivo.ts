import { useEffect, useState } from "react";

/**
 * Arquivo protegido (foto da bagagem, QR do código SID) baixado com o token e mostrado por uma URL local, liberada ao
 * sair da tela: a URL da API não serve direto no <img>, que não manda o cabeçalho de autorização.
 */
export function useUrlDoArquivo(baixar: () => Promise<Blob>): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let local: string | null = null;
    let ativo = true;
    baixar()
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
  }, [baixar]);

  return url;
}
