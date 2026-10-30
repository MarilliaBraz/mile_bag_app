import { useCallback, useId, useState } from "react";
import { Alerta, Carregando, Vazio } from "../../../../shared/components/Alerta";
import { Icone } from "../../../../shared/components/Icone";
import { Gaveta, Pagina, Painel } from "../../../../shared/components/Pagina";
import { useRecurso } from "../../../../shared/hooks/useRecurso";
import { formatarData, mensagemDeErro } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { cadastrarCompanhia, definirParceiras, listarCompanhias, listarParceiras } from "../services/companhiasService";
import type { CompanhiaAerea, EmpresaParceira } from "../types";

const CODIGO_IATA = /^([A-Z][A-Z0-9]|[0-9][A-Z])$/;

function CadastroCompanhiaForm({ aoCadastrar }: { aoCadastrar: (nome: string) => Promise<void> }) {
  const uid = useId();
  const t = useTextos().companhia.plataforma;
  const [identificador, setIdentificador] = useState("");
  const [nome, setNome] = useState("");
  const [codigoIata, setCodigoIata] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const pronto = identificador.trim() && nome.trim() && CODIGO_IATA.test(codigoIata) && email.includes("@");

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await cadastrarCompanhia({ identificador: identificador.trim(), nome: nome.trim(), codigoIata, emailAdministrador: email.trim() });
      await aoCadastrar(nome.trim());
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaCadastrar));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="formulario">
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      <div>
        <label htmlFor={`${uid}-nome`}>{t.nome}</label>
        <input id={`${uid}-nome`} autoComplete="off" value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div>
        <label htmlFor={`${uid}-iata`}>{t.codigoIata}</label>
        <input
          id={`${uid}-iata`}
          autoComplete="off"
          maxLength={2}
          value={codigoIata}
          onChange={(e) => setCodigoIata(e.target.value.toUpperCase())}
          aria-describedby={`${uid}-iata-ajuda`}
        />
        <span id={`${uid}-iata-ajuda`} className="texto-apoio">
          {t.codigoIataAjuda}
        </span>
      </div>
      <div>
        <label htmlFor={`${uid}-identificador`}>{t.identificador}</label>
        <input
          id={`${uid}-identificador`}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={t.identificadorExemplo}
          value={identificador}
          onChange={(e) => setIdentificador(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor={`${uid}-email`}>{t.emailAdministrador}</label>
        <input
          id={`${uid}-email`}
          type="email"
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby={`${uid}-email-ajuda`}
        />
        <span id={`${uid}-email-ajuda`} className="texto-apoio">
          {t.emailAjuda}
        </span>
      </div>
      <button type="submit" className="bloco" disabled={!pronto || enviando}>
        {enviando ? t.cadastrando : t.enviar}
      </button>
    </form>
  );
}

/** Empresas de entrega parceiras da companhia (HU37, RD23): caixas de marcar, salvas de uma vez. */
function ParceirasForm({ companhia, aoSalvar }: { companhia: CompanhiaAerea; aoSalvar: (quantidade: number) => void }) {
  const t = useTextos().companhia.encaminhamento;
  const carregar = useCallback(() => listarParceiras(companhia.id), [companhia.id]);
  const { dados: empresas, erro: erroCarregar, carregando } = useRecurso(carregar, t.falhaParceiras);
  const [marcadas, setMarcadas] = useState<Set<string> | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const selecao = marcadas ?? new Set((empresas ?? []).filter((e: EmpresaParceira) => e.parceira).map((e) => e.id));

  function alternar(id: string) {
    const nova = new Set(selecao);
    if (nova.has(id)) {
      nova.delete(id);
    } else {
      nova.add(id);
    }
    setMarcadas(nova);
  }

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      const salvas = await definirParceiras(companhia.id, [...selecao]);
      aoSalvar(salvas.filter((e) => e.parceira).length);
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaParceiras));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <Carregando />;
  }
  return (
    <form onSubmit={salvar} className="formulario">
      {(erro ?? erroCarregar) && <Alerta tipo="erro">{erro ?? erroCarregar}</Alerta>}
      <p className="texto-apoio">{t.parceirasAjuda}</p>
      {empresas && empresas.length === 0 && <p>{t.nenhumaEmpresa}</p>}
      {empresas && empresas.length > 0 && (
        <fieldset>
          <legend className="visualmente-oculto">{t.parceiras}</legend>
          {empresas.map((empresa) => (
            <label key={empresa.id} className="interruptor">
              <input type="checkbox" checked={selecao.has(empresa.id)} onChange={() => alternar(empresa.id)} />
              <span>
                {empresa.nome} <span className="texto-apoio mono">{empresa.identificador}</span>
              </span>
            </label>
          ))}
        </fieldset>
      )}
      <button type="submit" className="bloco" disabled={salvando || !empresas}>
        {salvando ? t.salvando : t.salvarParceiras}
      </button>
    </form>
  );
}

/** Companhias aéreas (HU33): lista e cadastro pela plataforma, com o convite do primeiro administrador (HU15). */
export function TelaCompanhias() {
  const t = useTextos().companhia.plataforma;
  const { dados: companhias, erro, carregando, recarregar } = useRecurso(listarCompanhias, t.falhaCarregar);
  const [criando, setCriando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [parceirasDe, setParceirasDe] = useState<CompanhiaAerea | null>(null);
  const tp = useTextos().companhia.encaminhamento;

  return (
    <Pagina
      titulo={t.titulo}
      descricao={t.descricao}
      acoes={
        <button type="button" onClick={() => setCriando(true)}>
          <Icone nome="mais" /> {t.cadastrar}
        </button>
      }
    >
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {resultado && (
        <Alerta tipo="sucesso" aoFechar={() => setResultado(null)}>
          {resultado}
        </Alerta>
      )}

      <Painel className="sem-recuo">
        {carregando && (
          <div style={{ padding: "0 1.25rem" }}>
            <Carregando texto={t.carregando} />
          </div>
        )}
        {companhias && companhias.length === 0 && (
          <div style={{ padding: "1.25rem" }}>
            <Vazio icone="predio" titulo={t.nenhuma}>
              {t.nenhumaDica}
            </Vazio>
          </div>
        )}
        {companhias && companhias.length > 0 && (
          <div className="tabela-rolavel">
            <table className="tabela">
              <thead>
                <tr>
                  <th scope="col">{t.colunaCompanhia}</th>
                  <th scope="col">{t.codigoIata}</th>
                  <th scope="col">{t.colunaIdentificador}</th>
                  <th scope="col">{t.colunaCadastro}</th>
                  <th scope="col">
                    <span className="visualmente-oculto">{tp.parceiras}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {companhias.map((companhia) => (
                  <tr key={companhia.id}>
                    <td>
                      <strong>{companhia.nome}</strong>
                    </td>
                    <td>
                      <span className="selo selo-info">{companhia.codigoIata}</span>
                    </td>
                    <td className="mono">{companhia.identificador}</td>
                    <td>{formatarData(companhia.criadoEm)}</td>
                    <td>
                      <button type="button" className="secundario" onClick={() => setParceirasDe(companhia)}>
                        <Icone nome="caminhao" /> {tp.parceiras}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Painel>

      <Gaveta aberta={criando} titulo={t.cadastrar} aoFechar={() => setCriando(false)}>
        <CadastroCompanhiaForm
          aoCadastrar={async (nome) => {
            setCriando(false);
            setResultado(t.cadastrada(nome));
            await recarregar();
          }}
        />
      </Gaveta>

      <Gaveta
        aberta={parceirasDe !== null}
        titulo={parceirasDe ? tp.parceirasDe(parceirasDe.nome) : tp.parceiras}
        aoFechar={() => setParceirasDe(null)}
      >
        {parceirasDe && (
          <ParceirasForm
            key={parceirasDe.id}
            companhia={parceirasDe}
            aoSalvar={(quantidade) => {
              setResultado(tp.parceirasSalvas(parceirasDe.nome, quantidade));
              setParceirasDe(null);
            }}
          />
        )}
      </Gaveta>
    </Pagina>
  );
}
