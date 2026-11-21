import { useEffect, useState } from "react";
import { reduzirFoto } from "../utils/reduzirFoto";
import { Icone } from "./Icone";

type Props = {
  id: string;
  rotulo: string;
  tirarFoto: string;
  fotoPronta: string;
  dica?: string;
  previa: string;
  foto: File | null;
  aoEscolher: (foto: File | null) => void;
  desabilitado?: boolean;
  /** V51: etapa já concluída - mostra a foto e "Corrigir", que pede o motivo antes de liberar a troca. */
  bloqueado?: boolean;
  aoCorrigir?: () => void;
  rotuloCorrigir?: string;
  /** Na correção de uma entrega já registrada a foto nova é opcional. */
  opcional?: boolean;
};

/**
 * Uma foto obrigatória tirada pela câmera traseira, já reduzida, com prévia para o motorista conferir se saiu legível
 * (BDO assinado, bagagem na porta, bagagem na retirada).
 */
export function CampoFoto({
  id,
  rotulo,
  tirarFoto,
  fotoPronta,
  dica,
  previa,
  foto,
  aoEscolher,
  desabilitado,
  bloqueado,
  aoCorrigir,
  rotuloCorrigir,
  opcional,
}: Props) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!foto) {
      setUrl(null);
      return;
    }
    const local = URL.createObjectURL(foto);
    setUrl(local);
    return () => URL.revokeObjectURL(local);
  }, [foto]);

  return (
    <div aria-disabled={desabilitado || undefined} className={desabilitado ? "campo-bloqueado" : undefined}>
      <span id={`${id}-rotulo`} className="destaque" style={{ display: "block", marginBottom: "0.375rem", fontSize: "1rem" }}>
        {rotulo}
        {!opcional && (
          <>
            {" "}
            <span className="campo-obrigatorio" aria-hidden="true">
              *
            </span>
          </>
        )}
      </span>
      {url && <img src={url} alt={previa} className="previa-foto mb-2" />}
      {bloqueado ? (
        <button type="button" className="secundario" onClick={aoCorrigir} disabled={desabilitado} aria-describedby={`${id}-rotulo`}>
          <Icone nome="ferramenta" /> {rotuloCorrigir}
        </button>
      ) : (
        <label className={`seletor-foto${foto ? " preenchido" : ""}`}>
          <Icone nome={foto ? "checkCirculo" : "camera"} />
          <strong>{foto ? fotoPronta : tirarFoto}</strong>
          {!foto && dica && <span>{dica}</span>}
          <input
            id={id}
            className="visualmente-oculto"
            required={!opcional}
            aria-required={!opcional}
            aria-labelledby={`${id}-rotulo`}
            type="file"
            accept="image/*"
            capture="environment"
            disabled={desabilitado}
            onChange={async (evento) => {
              const arquivo = evento.target.files?.[0] ?? null;
              aoEscolher(arquivo ? await reduzirFoto(arquivo) : null);
            }}
          />
        </label>
      )}
    </div>
  );
}
