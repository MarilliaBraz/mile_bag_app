import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useTextos } from "../utils/i18n/idioma";
import { reduzirFoto } from "../utils/reduzirFoto";
import { Icone } from "./Icone";

/** I: até 5 fotos de avaria em cada etapa (retirada e entrega). */
export const MAXIMO_FOTOS_AVARIA = 5;
const TAMANHO_MAXIMO_OBSERVACAO = 500;

type Props = {
  id: string;
  fotos: File[];
  /** O setter do estado: as fotos novas entram sobre o valor atual (duas fotos seguidas não se perdem). */
  aoMudarFotos: Dispatch<SetStateAction<File[]>>;
  observacao: string;
  aoMudarObservacao: (texto: string) => void;
  desabilitado?: boolean;
};

/** Fotos de possíveis avarias na bagagem, opcionais, com uma observação curta (itens 4 e 5). */
export function FotosAvaria({ id, fotos, aoMudarFotos, observacao, aoMudarObservacao, desabilitado }: Props) {
  const t = useTextos().motorista.avarias;
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    const locais = fotos.map((foto) => URL.createObjectURL(foto));
    setUrls(locais);
    return () => locais.forEach((url) => URL.revokeObjectURL(url));
  }, [fotos]);

  return (
    <fieldset className="pilha" disabled={desabilitado}>
      <legend className="destaque">{t.titulo}</legend>
      <p className="texto-apoio m-0">{t.dica(MAXIMO_FOTOS_AVARIA)}</p>
      {urls.length > 0 && (
        <ul className="fotos-avaria">
          {urls.map((url, indice) => (
            <li key={url}>
              <img src={url} alt={t.foto(indice + 1)} />
              <button
                type="button"
                className="botao-icone"
                aria-label={t.remover(indice + 1)}
                title={t.remover(indice + 1)}
                onClick={() => aoMudarFotos((atuais) => atuais.filter((_, i) => i !== indice))}
              >
                <Icone nome="fechar" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {fotos.length < MAXIMO_FOTOS_AVARIA && (
        <label className="seletor-foto">
          <Icone nome="camera" />
          <strong>{t.adicionar}</strong>
          <input
            id={id}
            className="visualmente-oculto"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={async (evento) => {
              const arquivo = evento.target.files?.[0];
              evento.target.value = "";
              if (arquivo) {
                const reduzida = await reduzirFoto(arquivo);
                aoMudarFotos((atuais) => [...atuais, reduzida].slice(0, MAXIMO_FOTOS_AVARIA));
              }
            }}
          />
        </label>
      )}
      {fotos.length > 0 && (
        <div>
          <label htmlFor={`${id}-observacao`}>{t.observacao}</label>
          <textarea
            id={`${id}-observacao`}
            rows={2}
            maxLength={TAMANHO_MAXIMO_OBSERVACAO}
            value={observacao}
            onChange={(evento) => aoMudarObservacao(evento.target.value)}
          />
        </div>
      )}
    </fieldset>
  );
}
