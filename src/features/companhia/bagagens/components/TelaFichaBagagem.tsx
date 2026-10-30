import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Alerta, Carregando } from "../../../../shared/components/Alerta";
import { Icone } from "../../../../shared/components/Icone";
import { MapaBase } from "../../../../shared/components/MapaBase";
import { Pagina, Painel } from "../../../../shared/components/Pagina";
import { formatarDataHora, mensagemDeErro } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { baixarFicha, buscarBagagem } from "../services/bagagensService";
import type { BagagemEncontrada } from "../types";
import { formatarDistancia } from "../utils/formatarDistancia";
import { FotoBagagem } from "./FotoBagagem";

/** Dado com o rótulo; vazio aparece como "-", para a ficha ter sempre os mesmos campos. */
function Dado({ rotulo, valor, mono = false }: { rotulo: string; valor?: string; mono?: boolean }) {
  const vazio = useTextos().companhia.ficha.vazio;
  return (
    <div>
      <dt>{rotulo}</dt>
      <dd className={mono ? "mono" : undefined}>{valor || vazio}</dd>
    </div>
  );
}

/** O que identifica a bagagem e o que a descreve: dados da etiqueta (HU34) ou descrição (HU35). */
function Dados({ bagagem: b }: { bagagem: BagagemEncontrada }) {
  const textos = useTextos().companhia;
  const t = textos.bagagens;
  const sem = textos.semEtiqueta;
  if (b.descricao) {
    const d = b.descricao;
    return (
      <Painel titulo={textos.ficha.descricao}>
        <dl className="dados-grade">
          <Dado rotulo={sem.tipo} valor={sem.tipos[d.tipoVolume]} />
          <Dado rotulo={sem.tamanho} valor={`${sem.tamanhos[d.tamanho]} (${sem.tamanhosAjuda[d.tamanho]})`} />
          <Dado rotulo={sem.cor} valor={sem.cores[d.cor]} />
          <Dado rotulo={sem.sinais} valor={d.sinais.map((s) => sem.sinaisOpcoes[s]).join(", ")} />
          <Dado rotulo={sem.marca} valor={d.marca} />
          <Dado rotulo={sem.observacoes} valor={d.observacoes} />
        </dl>
      </Painel>
    );
  }
  // O rascunho ainda não foi conferido: mostra o que foi lido da foto.
  const e = b.etiqueta ?? b.lido;
  return (
    <Painel titulo={textos.ficha.dadosEtiqueta}>
      <dl className="dados-grade">
        <Dado rotulo={t.numeroEtiqueta} valor={e.numeroEtiqueta} mono />
        <Dado rotulo={t.companhia} valor={e.companhia} />
        <Dado rotulo={t.destino} valor={e.destino} />
        <Dado rotulo={t.voo} valor={e.voo} />
        <Dado rotulo={t.nomePassageiro} valor={e.nomePassageiro} />
      </dl>
    </Painel>
  );
}

/** Ficha da bagagem encontrada na tela (HU36, RI23), com o PDF para baixar e, na sem etiqueta, a etiqueta para imprimir. */
export function TelaFichaBagagem() {
  const textos = useTextos().companhia;
  const t = textos.ficha;
  const { id = "" } = useParams();
  const voltar = (useLocation().state as { voltar?: string } | null)?.voltar ?? "/companhia/bagagens";
  const [bagagem, setBagagem] = useState<BagagemEncontrada | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [baixando, setBaixando] = useState(false);

  useEffect(() => {
    buscarBagagem(id)
      .then(setBagagem)
      .catch((excecao) => setErro(mensagemDeErro(excecao, t.falhaCarregar)));
  }, [id, t.falhaCarregar]);

  async function baixar(b: BagagemEncontrada) {
    setBaixando(true);
    setErro(null);
    try {
      await baixarFicha(b);
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaBaixar));
    } finally {
      setBaixando(false);
    }
  }

  const b = bagagem;
  const identificador = b
    ? (b.descricao?.codigoSid ?? b.etiqueta?.numeroEtiqueta ?? b.lido.numeroEtiqueta ?? textos.inicio.semNumero)
    : t.titulo;
  const { latitude, longitude } = b?.localizacao ?? {};
  return (
    <Pagina
      titulo={<span className="mono">{identificador}</span>}
      descricao={b ? textos.consulta.tipos[b.tipo] : undefined}
      voltarPara={voltar}
      rotuloVoltar={t.voltar}
      acoes={
        b?.situacao === "REGISTRADA" && (
          <div className="linha-acoes">
            {b.descricao && (
              <Link to={`/companhia/bagagens/${b.id}/etiqueta`} className="botao secundario">
                <Icone nome="impressora" /> {t.etiquetaImprimir}
              </Link>
            )}
            <button type="button" onClick={() => baixar(b)} disabled={baixando}>
              <Icone nome="documento" /> {baixando ? t.baixando : t.baixarPdf}
            </button>
          </div>
        )
      }
    >
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {!b && !erro && <Carregando />}
      {b && (
        <>
          {b.situacao === "RASCUNHO" && <Alerta tipo="aviso">{t.rascunho}</Alerta>}
          <div className="grade-paineis">
            <Painel>
              <FotoBagagem bagagem={b} alt={b.descricao ? textos.semEtiqueta.fotoAlt : textos.bagagens.fotoAlt} />
            </Painel>
            <Dados bagagem={b} />
          </div>
          <div className="grade-paineis">
            <Painel titulo={t.localizacao}>
              <dl className="dados-grade">
                <Dado
                  rotulo={textos.bagagens.aeroporto}
                  valor={b.aeroporto && `${b.aeroporto.codigo} · ${b.aeroporto.nome} · ${b.aeroporto.cidade}/${b.aeroporto.uf}`}
                />
                <Dado
                  rotulo={t.distancia}
                  valor={b.aeroporto?.distanciaMetros !== undefined ? formatarDistancia(b.aeroporto.distanciaMetros) : undefined}
                />
                <Dado
                  rotulo={t.coordenadas}
                  valor={latitude !== undefined && longitude !== undefined ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` : undefined}
                  mono
                />
                <Dado rotulo={t.origem} valor={textos.bagagens.localizacao[b.localizacao.origem]} />
              </dl>
              {latitude !== undefined && longitude !== undefined ? (
                <MapaBase
                  centro={{ latitude, longitude }}
                  zoom={16}
                  marcadores={[{ posicao: { latitude, longitude }, rotulo: identificador }]}
                  descricao={t.mapa(identificador)}
                />
              ) : (
                <p className="texto-apoio">{t.semLocalizacao}</p>
              )}
            </Painel>
            <Painel titulo={t.registro}>
              <dl>
                <Dado rotulo={t.registradaPor} valor={b.registradoPor} />
                <Dado rotulo={t.registradaEm} valor={b.registradaEm && formatarDataHora(b.registradaEm)} />
                <Dado rotulo={t.fotografadaEm} valor={formatarDataHora(b.criadoEm)} />
              </dl>
            </Painel>
          </div>
        </>
      )}
    </Pagina>
  );
}
