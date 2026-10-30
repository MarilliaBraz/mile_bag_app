import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { Alerta, Carregando } from "../../../../shared/components/Alerta";
import { Icone } from "../../../../shared/components/Icone";
import { mensagemDeErro } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { buscarBagagem } from "../services/bagagensService";
import type { BagagemEncontrada } from "../types";

type Props = {
  tituloCaptura: string;
  tituloConferencia: string;
  falhaCarregar: string;
  captura: ReactNode;
  conferencia: (bagagem: BagagemEncontrada) => ReactNode;
};

/** Moldura do registro (HU34, HU35): sem `:id` na rota, a captura; com `:id`, carrega o rascunho e mostra a conferência. */
export function TelaRegistro({ tituloCaptura, tituloConferencia, falhaCarregar, captura, conferencia }: Props) {
  const t = useTextos().companhia.bagagens;
  const { id } = useParams();
  const [bagagem, setBagagem] = useState<BagagemEncontrada | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    buscarBagagem(id)
      .then(setBagagem)
      .catch((excecao) => setErro(mensagemDeErro(excecao, falhaCarregar)));
  }, [id, falhaCarregar]);

  return (
    <div className="tela-entrada tela-companhia">
      <main className="pilha">
        <Link to="/companhia/inicio" className="texto-apoio nao-imprimir">
          <Icone nome="voltar" /> {t.voltar}
        </Link>
        <h1>{id ? tituloConferencia : tituloCaptura}</h1>
        {!id && captura}
        {id && erro && <Alerta tipo="erro">{erro}</Alerta>}
        {id && !bagagem && !erro && <Carregando />}
        {bagagem && conferencia(bagagem)}
      </main>
    </div>
  );
}
