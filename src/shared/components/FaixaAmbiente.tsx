import { useEffect, useState } from "react";
import { lerRotuloDoServidor, rotuloDoBuild } from "../utils/ambiente";
import { useTextos } from "../utils/i18n/idioma";

/**
 * Faixa no topo de todas as telas quando o app NÃO é o de produção (ex.:
 * "Homologação"). Quem valida uma mudança sabe em qual ambiente está e qual
 * versão está vendo; em produção o rótulo fica vazio e nada aparece. O rótulo
 * vem do build ou, se ele não definiu, do servidor (ver utils/ambiente.ts).
 */
export function FaixaAmbiente() {
  const t = useTextos().ambiente;
  const [ambiente, setAmbiente] = useState(rotuloDoBuild);

  useEffect(() => {
    if (rotuloDoBuild()) {
      return;
    }
    const controle = new AbortController();
    void lerRotuloDoServidor(controle.signal).then((rotulo) => {
      if (!controle.signal.aborted) {
        setAmbiente(rotulo);
      }
    });
    return () => controle.abort();
  }, []);

  if (!ambiente) {
    return null;
  }
  const versao = import.meta.env.VITE_VERSAO?.trim();
  return (
    <div className="faixa-ambiente" role="note" aria-label={t.rotulo(ambiente)}>
      {/* No celular cabe só o essencial numa linha; a frase completa e a versão aparecem em telas largas. */}
      <span className="faixa-curta" aria-hidden="true">
        {t.curta(ambiente)}
      </span>
      <span className="faixa-longa" aria-hidden="true">
        {t.longa(ambiente)}
      </span>
      {versao && <small className="faixa-longa">{versao}</small>}
    </div>
  );
}
