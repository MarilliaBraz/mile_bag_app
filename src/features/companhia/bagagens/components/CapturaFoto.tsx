import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Coordenada } from "../../../../shared/components/MapaBase";
import { Alerta, Carregando } from "../../../../shared/components/Alerta";
import { Icone } from "../../../../shared/components/Icone";
import { mensagemDeErro } from "../../../../shared/utils/formatar";
import { obterPosicaoAtual } from "../../../../shared/utils/posicaoAtual";
import type { BagagemEncontrada } from "../types";

type Props = {
  instrucao: string;
  tirarFoto: string;
  lendo: string;
  falha: string;
  /** Envia a foto e a posição; a API devolve o rascunho. */
  enviar: (foto: File, posicao: Coordenada | null) => Promise<BagagemEncontrada>;
  /** Para onde ir com o rascunho criado (a conferência de cada tipo). */
  destino: (rascunho: BagagemEncontrada) => string;
};

/** Passo 1 do registro (HU34, HU35; RI21, RI22): a foto pela câmera traseira e, junto, a posição do celular. */
export function CapturaFoto({ instrucao, tirarFoto, lendo, falha, enviar, destino }: Props) {
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function aoEscolher(foto: File | undefined) {
    if (!foto) {
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      // A posição é pedida junto: se a foto não trouxer GPS, vale a do celular.
      const posicao = await obterPosicaoAtual(8_000);
      const rascunho = await enviar(foto, posicao);
      navigate(destino(rascunho), { replace: true });
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, falha));
      setEnviando(false);
    }
  }

  return (
    <>
      <p>{instrucao}</p>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {enviando ? (
        <Carregando texto={lendo} />
      ) : (
        <label className="botao grande bloco">
          <Icone nome="camera" /> {tirarFoto}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="visualmente-oculto"
            onChange={(evento) => aoEscolher(evento.target.files?.[0])}
          />
        </label>
      )}
    </>
  );
}
