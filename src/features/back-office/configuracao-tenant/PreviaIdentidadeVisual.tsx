import { useEffect, useState } from "react";
import { useTextos } from "../../../shared/i18n/idioma";
import type { IdentidadeVisual } from "./identidadeVisualApi";
import { baixarLogotipo } from "./identidadeVisualApi";

/**
 * Como os PDFs vão sair (HU13): logotipo acima do cabeçalho. O logotipo exige
 * autorização, então é baixado como arquivo e exibido por URL local; `versao`
 * força nova busca depois de um upload.
 */
export function PreviaIdentidadeVisual({
  identidade,
  versao = 0,
  arquivoLocal,
}: {
  identidade: IdentidadeVisual;
  versao?: number;
  arquivoLocal?: File | null;
}) {
  const [urlLogotipo, setUrlLogotipo] = useState<string | null>(null);
  const temLogotipo = identidade.logotipoUrl !== null;
  const t = useTextos().backOffice.identidade;

  useEffect(() => {
    if (arquivoLocal) {
      const url = URL.createObjectURL(arquivoLocal);
      setUrlLogotipo(url);
      return () => URL.revokeObjectURL(url);
    }
    if (!temLogotipo) {
      setUrlLogotipo(null);
      return;
    }
    let url: string | null = null;
    let cancelado = false;
    baixarLogotipo()
      .then((blob) => {
        if (!cancelado) {
          url = URL.createObjectURL(blob);
          setUrlLogotipo(url);
        }
      })
      .catch(() => setUrlLogotipo(null));
    return () => {
      cancelado = true;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [temLogotipo, versao, arquivoLocal]);

  if (!temLogotipo && !identidade.cabecalho && !arquivoLocal) {
    return <p className="texto-apoio">{t.semIdentidade}</p>;
  }

  return (
    <div role="img" aria-label={t.previaRotulo} className="folha-previa">
      {urlLogotipo && <img src={urlLogotipo} alt="" style={{ maxHeight: 64, maxWidth: "100%" }} />}
      {identidade.cabecalho && <div style={{ marginTop: "0.5rem", whiteSpace: "pre-line", fontWeight: 600 }}>{identidade.cabecalho}</div>}
      <div className="linhas-falsas" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
