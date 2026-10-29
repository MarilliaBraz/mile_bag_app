import { useEffect, useId, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Alerta, Carregando, Vazio } from "../../../../shared/components/Alerta";
import { Icone } from "../../../../shared/components/Icone";
import { Pagina, Painel } from "../../../../shared/components/Pagina";
import { useRecurso } from "../../../../shared/hooks/useRecurso";
import { formatarDataHora, mensagemDeErro } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { consultarBagagens, exportarCsv, listarAeroportos } from "../services/bagagensService";
import type { BagagemEncontrada, PaginaBagagens } from "../types";
import { CAMPOS_FILTRO, filtrosDaUrl } from "../utils/filtrosConsulta";
import { CORES, TIPOS_VOLUME } from "../utils/opcoesDescricao";

/** Filtros num formulário sem estado: o que vale é a URL, e "Buscar" a reescreve (a ficha volta para a mesma busca). */
function Filtros({ parametros, aoBuscar }: { parametros: URLSearchParams; aoBuscar: (filtros: URLSearchParams) => void }) {
  const uid = useId();
  const textos = useTextos().companhia;
  const t = textos.consulta;
  const sem = textos.semEtiqueta;
  const { dados: aeroportos } = useRecurso(listarAeroportos, t.falhaCarregar);
  const filtros = filtrosDaUrl(parametros);

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    const novos = new URLSearchParams();
    for (const campo of CAMPOS_FILTRO) {
      const valor = String(dados.get(campo) ?? "").trim();
      if (valor) novos.set(campo, valor);
    }
    aoBuscar(novos);
  }

  const id = (campo: string) => `${uid}-${campo}`;
  return (
    // A lista de aeroportos chega depois: remontar com ela mostra o aeroporto do filtro escolhido.
    <form key={`${parametros.toString()}-${aeroportos?.length ?? 0}`} className="filtros-consulta" onSubmit={enviar} role="search">
      <div className="filtro-largo">
        <label htmlFor={id("texto")}>{t.texto}</label>
        <input id={id("texto")} name="texto" type="search" maxLength={60} defaultValue={filtros.texto} />
      </div>
      <div>
        <label htmlFor={id("aeroporto")}>{t.aeroporto}</label>
        <select id={id("aeroporto")} name="aeroporto" defaultValue={filtros.aeroporto ?? ""}>
          <option value="">{t.todos}</option>
          {aeroportos?.map((a) => (
            <option key={a.codigo} value={a.codigo}>
              {a.codigo} · {a.cidade}/{a.uf}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={id("de")}>{t.de}</label>
        <input id={id("de")} name="de" type="date" defaultValue={filtros.de} />
      </div>
      <div>
        <label htmlFor={id("ate")}>{t.ate}</label>
        <input id={id("ate")} name="ate" type="date" defaultValue={filtros.ate} />
      </div>
      <div>
        <label htmlFor={id("tipo")}>{t.tipo}</label>
        <select id={id("tipo")} name="tipo" defaultValue={filtros.tipo ?? ""}>
          <option value="">{t.todos}</option>
          <option value="COM_ETIQUETA">{t.tipos.COM_ETIQUETA}</option>
          <option value="SEM_ETIQUETA">{t.tipos.SEM_ETIQUETA}</option>
        </select>
      </div>
      <div>
        <label htmlFor={id("tipoVolume")}>{t.tipoVolume}</label>
        <select id={id("tipoVolume")} name="tipoVolume" defaultValue={filtros.tipoVolume ?? ""}>
          <option value="">{t.todos}</option>
          {TIPOS_VOLUME.map((tipo) => (
            <option key={tipo} value={tipo}>
              {sem.tipos[tipo]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={id("cor")}>{t.cor}</label>
        <select id={id("cor")} name="cor" defaultValue={filtros.cor ?? ""}>
          <option value="">{t.todas}</option>
          {CORES.map((cor) => (
            <option key={cor} value={cor}>
              {sem.cores[cor]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={id("situacao")}>{t.situacao}</label>
        <select id={id("situacao")} name="situacao" defaultValue={filtros.situacao ?? "REGISTRADA"}>
          <option value="REGISTRADA">{t.situacoes.REGISTRADA}</option>
          <option value="RASCUNHO">{t.situacoes.RASCUNHO}</option>
        </select>
      </div>
      <div className="linha-acoes filtro-largo">
        <button type="submit">
          <Icone nome="busca" /> {t.buscar}
        </button>
        <button type="button" className="secundario" onClick={() => aoBuscar(new URLSearchParams())}>
          {t.limpar}
        </button>
      </div>
    </form>
  );
}

/** Uma linha da lista: o número (ou o SID) abre a ficha, com a busca atual para voltar. */
function LinhaBagagem({ bagagem: b, voltar }: { bagagem: BagagemEncontrada; voltar: string }) {
  const textos = useTextos().companhia;
  const t = textos.consulta;
  const sem = textos.semEtiqueta;
  const identificador = b.descricao?.codigoSid ?? b.etiqueta?.numeroEtiqueta ?? b.lido.numeroEtiqueta ?? textos.inicio.semNumero;
  const dados = b.descricao
    ? sem.resumo(sem.tipos[b.descricao.tipoVolume], sem.cores[b.descricao.cor])
    : [b.etiqueta?.nomePassageiro, b.etiqueta?.voo].filter(Boolean).join(" · ");
  return (
    <tr>
      <td>
        <Link to={`/companhia/bagagens/${b.id}`} state={{ voltar }} className="mono">
          {identificador}
        </Link>
        <span className="texto-apoio em-bloco">
          {t.tipos[b.tipo]}
          {b.situacao === "RASCUNHO" && <span className="selo selo-aviso">{t.rascunho}</span>}
        </span>
      </td>
      <td>{b.aeroporto && <span className="selo selo-info">{b.aeroporto.codigo}</span>}</td>
      <td>{dados}</td>
      <td>
        {b.registradoPor}
        <span className="texto-apoio em-bloco">{formatarDataHora(b.registradaEm ?? b.criadoEm)}</span>
      </td>
    </tr>
  );
}

/** Consulta das bagagens encontradas da companhia (HU36, RI23): filtros, lista paginada e exportação em CSV. */
export function TelaConsultaBagagens() {
  const t = useTextos().companhia.consulta;
  const [parametros, setParametros] = useSearchParams();
  const chave = parametros.toString();
  const pagina = Math.max(0, Number(parametros.get("pagina")) || 0);
  // A resposta guarda de qual busca veio: enquanto a URL muda e a nova não chega, a tela mostra "carregando".
  const [resposta, setResposta] = useState<{ chave: string; dados?: PaginaBagagens; erro?: string } | null>(null);
  const [erroExportar, setErroExportar] = useState<string | null>(null);
  const [exportando, setExportando] = useState(false);
  const atual = resposta?.chave === chave ? resposta : null;
  const resultado = atual?.dados ?? null;
  const erro = atual?.erro ?? erroExportar;

  useEffect(() => {
    let ativo = true;
    const busca = new URLSearchParams(chave);
    consultarBagagens(filtrosDaUrl(busca), Math.max(0, Number(busca.get("pagina")) || 0))
      .then((dados) => ativo && setResposta({ chave, dados }))
      .catch((excecao) => ativo && setResposta({ chave, erro: mensagemDeErro(excecao, t.falhaCarregar) }));
    return () => {
      ativo = false;
    };
  }, [chave, t.falhaCarregar]);

  async function exportar() {
    setExportando(true);
    setErroExportar(null);
    try {
      await exportarCsv(filtrosDaUrl(parametros));
    } catch (excecao) {
      setErroExportar(mensagemDeErro(excecao, t.falhaExportar));
    } finally {
      setExportando(false);
    }
  }

  function irParaPagina(numero: number) {
    const proximos = new URLSearchParams(parametros);
    if (numero > 0) proximos.set("pagina", String(numero));
    else proximos.delete("pagina");
    setParametros(proximos);
  }

  const paginas = resultado ? Math.max(1, Math.ceil(resultado.total / resultado.tamanho)) : 1;
  return (
    <Pagina
      titulo={t.titulo}
      descricao={t.descricao}
      acoes={
        <button type="button" className="secundario" onClick={exportar} disabled={exportando}>
          <Icone nome="baixar" /> {exportando ? t.exportando : t.exportar}
        </button>
      }
    >
      <Painel>
        <Filtros parametros={parametros} aoBuscar={setParametros} />
      </Painel>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {!resultado && !erro && <Carregando texto={t.carregando} />}
      {resultado && resultado.total === 0 && (
        <Vazio icone="mala" titulo={t.nenhuma}>
          {t.nenhumaDica}
        </Vazio>
      )}
      {resultado && resultado.total > 0 && (
        <Painel className="sem-recuo" titulo={t.total(resultado.total)}>
          <div className="tabela-rolavel">
            <table className="tabela">
              <thead>
                <tr>
                  <th scope="col">{t.colunaBagagem}</th>
                  <th scope="col">{t.colunaAeroporto}</th>
                  <th scope="col">{t.colunaDados}</th>
                  <th scope="col">{t.colunaRegistro}</th>
                </tr>
              </thead>
              <tbody>
                {resultado.itens.map((b) => (
                  <LinhaBagagem key={b.id} bagagem={b} voltar={`/companhia/bagagens${chave ? `?${chave}` : ""}`} />
                ))}
              </tbody>
            </table>
          </div>
          {paginas > 1 && (
            <nav className="paginacao" aria-label={t.pagina(pagina + 1, paginas)}>
              <button type="button" className="secundario compacto" disabled={pagina === 0} onClick={() => irParaPagina(pagina - 1)}>
                {t.anterior}
              </button>
              <span className="texto-apoio">{t.pagina(pagina + 1, paginas)}</span>
              <button
                type="button"
                className="secundario compacto"
                disabled={pagina + 1 >= paginas}
                onClick={() => irParaPagina(pagina + 1)}
              >
                {t.proxima}
              </button>
            </nav>
          )}
        </Painel>
      )}
    </Pagina>
  );
}
