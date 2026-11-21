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
};

/**
 * Uma foto obrigatória tirada pela câmera traseira, já reduzida, com prévia para o motorista conferir se saiu legível
 * (BDO assinado, bagagem na porta, bagagem na retirada).
 */
export function CampoFoto({ id, rotulo, tirarFoto, fotoPronta, dica, previa, foto, aoEscolher, desabilitado }: Props) {
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
        {rotulo}{" "}
        <span className="campo-obrigatorio" aria-hidden="true">
          *
        </span>
      </span>
      {url && <img src={url} alt={previa} className="previa-foto mb-2" />}
      <label className={`seletor-foto${foto ? " preenchido" : ""}`}>
        <Icone nome={foto ? "checkCirculo" : "camera"} />
        <strong>{foto ? fotoPronta : tirarFoto}</strong>
        {!foto && dica && <span>{dica}</span>}
        <input
          id={id}
          className="visualmente-oculto"
          required
          aria-required="true"
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
    </div>
  );
}
