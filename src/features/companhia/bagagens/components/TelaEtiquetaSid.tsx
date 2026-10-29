import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Alerta, Carregando } from "../../../../shared/components/Alerta";
import { Icone } from "../../../../shared/components/Icone";
import { formatarDataHora, mensagemDeErro } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { useUrlDoArquivo } from "../hooks/useUrlDoArquivo";
import { baixarQr, buscarBagagem } from "../services/bagagensService";
import type { BagagemEncontrada, DescricaoBagagem } from "../types";

/** A etiqueta em si: o que sai na impressão (QR, código, aeroporto, data e a descrição curta). */
function Etiqueta({ bagagem, descricao }: { bagagem: BagagemEncontrada; descricao: DescricaoBagagem }) {
  const textos = useTextos().companhia.semEtiqueta;
  const t = textos.etiqueta;
  const qr = useUrlDoArquivo(useCallback(() => baixarQr(bagagem), [bagagem]));

  return (
    <article className="etiqueta-sid" aria-label={t.cabecalho}>
      <p className="etiqueta-sid-cabecalho">{t.cabecalho}</p>
      {qr ? (
        <img className="etiqueta-sid-qr" src={qr} alt={t.qrAlt(descricao.codigoSid)} />
      ) : (
        <div className="etiqueta-sid-qr" aria-hidden="true" />
      )}
      <p className="etiqueta-sid-codigo mono">{descricao.codigoSid}</p>
      <dl className="etiqueta-sid-dados">
        <div>
          <dt>{t.aeroporto}</dt>
          <dd>{bagagem.aeroporto ? `${bagagem.aeroporto.codigo} · ${bagagem.aeroporto.cidade}/${bagagem.aeroporto.uf}` : ""}</dd>
        </div>
        <div>
          <dt>{t.registradaEm}</dt>
          <dd>{formatarDataHora(bagagem.registradaEm ?? bagagem.criadoEm)}</dd>
        </div>
        <div>
          <dt>{t.descricao}</dt>
          <dd>
            {textos.tipos[descricao.tipoVolume]} · {textos.tamanhos[descricao.tamanho]} · {textos.cores[descricao.cor]}
          </dd>
        </div>
      </dl>
    </article>
  );
}

/** Etiqueta da bagagem sem etiqueta (HU35, RI22) em `/companhia/bagagens/:id/etiqueta`: aberta ao registrar e pelos recentes. */
export function TelaEtiquetaSid() {
  const textos = useTextos().companhia;
  const t = textos.semEtiqueta.etiqueta;
  const { id = "" } = useParams();
  const [aviso, setAviso] = useState<string | null>((useLocation().state as { aviso?: string } | null)?.aviso ?? null);
  const [bagagem, setBagagem] = useState<BagagemEncontrada | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    buscarBagagem(id)
      .then(setBagagem)
      .catch((excecao) => setErro(mensagemDeErro(excecao, t.falhaCarregar)));
  }, [id, t.falhaCarregar]);

  return (
    <div className="tela-entrada tela-companhia">
      <main className="pilha">
        <Link to="/companhia/inicio" className="texto-apoio nao-imprimir">
          <Icone nome="voltar" /> {textos.bagagens.voltar}
        </Link>
        <h1 className="nao-imprimir">{t.titulo}</h1>
        {aviso && (
          <div className="nao-imprimir">
            <Alerta tipo="sucesso" aoFechar={() => setAviso(null)}>
              {aviso}
            </Alerta>
          </div>
        )}
        {erro && <Alerta tipo="erro">{erro}</Alerta>}
        {!bagagem && !erro && <Carregando />}
        {bagagem && !bagagem.descricao && <Alerta tipo="aviso">{t.semCodigo}</Alerta>}
        {bagagem?.descricao && (
          <>
            <p className="nao-imprimir">{t.instrucao}</p>
            <Etiqueta bagagem={bagagem} descricao={bagagem.descricao} />
            <button type="button" className="grande bloco nao-imprimir" onClick={() => window.print()}>
              <Icone nome="impressora" /> {t.imprimir}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
