import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { Alerta, Vazio } from "../../../../shared/components/Alerta";
import { Icone } from "../../../../shared/components/Icone";
import { MapaBase } from "../../../../shared/components/MapaBase";
import { Pagina, Painel } from "../../../../shared/components/Pagina";
import { formatarDataHora, mensagemDeErro } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { buscarNoPais } from "../services/bagagensService";
import type { BagagemNacional } from "../types";
import { etiquetaValida, normalizarEtiqueta } from "../utils/filtrosConsulta";

/** Um registro achado: de outra companhia, só companhia, aeroporto, data e local (RD22); da minha, abre a ficha. */
function Achado({ achado: a }: { achado: BagagemNacional }) {
  const t = useTextos().companhia.buscaNacional;
  const companhia = [a.companhia.nome, a.companhia.codigoIata && `(${a.companhia.codigoIata})`].filter(Boolean).join(" ");
  return (
    <li className="cartao pilha">
      <div>
        <strong>{companhia}</strong> {a.daMinhaCompanhia && <span className="selo selo-sucesso">{t.minhaCompanhia}</span>}
        <span className="em-bloco">
          <span className="selo selo-info">{a.aeroporto.codigo}</span> {a.aeroporto.nome} · {a.aeroporto.cidade}/{a.aeroporto.uf}
        </span>
        <span className="texto-apoio em-bloco">{formatarDataHora(a.registradaEm)}</span>
      </div>
      {a.latitude !== undefined && a.longitude !== undefined ? (
        <MapaBase
          centro={{ latitude: a.latitude, longitude: a.longitude }}
          zoom={15}
          altura={200}
          marcadores={[{ posicao: { latitude: a.latitude, longitude: a.longitude }, rotulo: companhia }]}
          descricao={t.mapa(companhia)}
        />
      ) : (
        <span className="texto-apoio">{t.semLocalizacao}</span>
      )}
      {a.id && (
        <Link to={`/companhia/bagagens/${a.id}`} state={{ voltar: "/companhia/busca-nacional" }} className="botao secundario">
          <Icone nome="documento" /> {t.abrirFicha}
        </Link>
      )}
    </li>
  );
}

/** Busca nacional por etiqueta (HU36, RD22, RI23): a única consulta que mostra registros de outras companhias. */
export function TelaBuscaNacional() {
  const uid = useId();
  const t = useTextos().companhia.buscaNacional;
  const [digitado, setDigitado] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ numero: string; achados: BagagemNacional[] } | null>(null);
  const numero = normalizarEtiqueta(digitado);
  const valido = etiquetaValida(numero);

  async function buscar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setBuscando(true);
    try {
      setResultado({ numero, achados: await buscarNoPais(numero) });
    } catch (excecao) {
      setResultado(null);
      setErro(mensagemDeErro(excecao, t.falhaBuscar));
    } finally {
      setBuscando(false);
    }
  }

  return (
    <Pagina titulo={t.titulo} descricao={t.descricao}>
      <Painel>
        <form className="formulario" onSubmit={buscar} role="search">
          <div>
            <label htmlFor={`${uid}-etiqueta`}>{t.etiqueta}</label>
            <input
              id={`${uid}-etiqueta`}
              className="mono"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={digitado}
              onChange={(e) => setDigitado(e.target.value)}
              aria-describedby={`${uid}-ajuda`}
              aria-invalid={digitado.trim() !== "" && !valido}
            />
            <span id={`${uid}-ajuda`} className="texto-apoio">
              {digitado.trim() !== "" && !valido ? t.invalido : t.etiquetaAjuda}
            </span>
          </div>
          <button type="submit" disabled={!valido || buscando}>
            <Icone nome="busca" /> {buscando ? t.buscando : t.buscar}
          </button>
          <p className="texto-apoio">{t.privacidade}</p>
        </form>
      </Painel>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {resultado && resultado.achados.length === 0 && <Vazio icone="busca" titulo={t.nenhum(resultado.numero)} />}
      {resultado && resultado.achados.length > 0 && (
        <section className="pilha" aria-live="polite">
          <h2>{t.achados(resultado.achados.length, resultado.numero)}</h2>
          <ul className="lista">
            {resultado.achados.map((a, indice) => (
              <Achado key={a.id ?? `${a.registradaEm}-${indice}`} achado={a} />
            ))}
          </ul>
        </section>
      )}
    </Pagina>
  );
}
