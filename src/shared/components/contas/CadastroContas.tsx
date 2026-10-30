import { useId, useState } from "react";
import { formatarData, mensagemDeErro } from "../../utils/formatar";
import { useRecurso } from "../../hooks/useRecurso";
import { useTextos } from "../../utils/i18n/idioma";
import { ConfirmarAcao } from "../ConfirmarAcao";
import { LoteContas } from "./LoteContas";
import { ContextoContas, useContas, type TextosContas } from "./contexto";
import type { Conta, ServicoContas } from "../../types/contas";
import { Alerta, Carregando, Vazio } from "../Alerta";
import { Icone } from "../Icone";
import { Avatar, Gaveta, Pagina, Painel } from "../Pagina";

const TAMANHO_MINIMO_SENHA = 8;

function NovaContaForm({ aoCriar }: { aoCriar: (nome: string) => Promise<void> }) {
  const uid = useId();
  const [nome, setNome] = useState("");
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const { t, servico } = useContas();

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await servico.criar({ nome: nome.trim(), login: login.trim(), senha });
      await aoCriar(nome.trim());
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaCadastrar));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="formulario">
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      <div>
        <label htmlFor={`${uid}-nome`}>{t.nomeCompleto}</label>
        <input id={`${uid}-nome`} autoComplete="off" value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div>
        <label htmlFor={`${uid}-login`}>{t.login}</label>
        <input
          id={`${uid}-login`}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          aria-describedby={`${uid}-login-ajuda`}
        />
        <span id={`${uid}-login-ajuda`} className="texto-apoio">
          {t.loginAjuda}
        </span>
      </div>
      <div>
        <label htmlFor={`${uid}-senha`}>{t.senhaInicial}</label>
        <input
          id={`${uid}-senha`}
          type="password"
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          aria-describedby={`${uid}-senha-ajuda`}
        />
        <span id={`${uid}-senha-ajuda`} className="texto-apoio">
          {t.senhaInicialAjuda(TAMANHO_MINIMO_SENHA)}
        </span>
      </div>
      <button type="submit" className="bloco" disabled={!nome.trim() || !login.trim() || senha.length < TAMANHO_MINIMO_SENHA || salvando}>
        {salvando ? t.cadastrando : t.cadastrar}
      </button>
    </form>
  );
}

function EditarForm({ conta, aoConcluir }: { conta: Conta; aoConcluir: () => Promise<void> }) {
  const uid = useId();
  const [nome, setNome] = useState(conta.nome);
  const [login, setLogin] = useState(conta.login);
  const [erro, setErro] = useState<string | null>(null);
  const textos = useTextos().backOffice;
  const { t, servico } = useContas();

  const nomeMudou = nome.trim() !== "" && nome.trim() !== conta.nome;
  const loginMudou = login.trim() !== "" && login.trim() !== conta.login;

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    try {
      await servico.atualizar(conta.id, {
        ...(nomeMudou ? { nome: nome.trim() } : {}),
        ...(loginMudou ? { login: login.trim() } : {}),
      });
      await aoConcluir();
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaSalvar));
    }
  }

  return (
    <form onSubmit={enviar} className="formulario">
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      <div>
        <label htmlFor={`${uid}-nome`}>{t.nome}</label>
        <input id={`${uid}-nome`} value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div>
        <label htmlFor={`${uid}-login`}>{t.login}</label>
        <input id={`${uid}-login`} autoCapitalize="none" value={login} onChange={(e) => setLogin(e.target.value)} />
      </div>
      {loginMudou && <Alerta tipo="aviso">{t.loginNovoAviso}</Alerta>}
      <button type="submit" className="bloco" disabled={!nomeMudou && !loginMudou}>
        {textos.geral.salvarAlteracoes}
      </button>
    </form>
  );
}

function NovaSenhaForm({ conta, aoConcluir }: { conta: Conta; aoConcluir: () => void }) {
  const uid = useId();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salva, setSalva] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const textos = useTextos().backOffice;
  const { t, servico } = useContas();

  async function enviar() {
    setErro(null);
    try {
      await servico.redefinirSenha(conta.id, senha);
      setSenha("");
      setSalva(true);
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaRedefinir));
    } finally {
      setConfirmando(false);
    }
  }

  return (
    <form
      onSubmit={(evento) => {
        evento.preventDefault();
        setConfirmando(true);
      }}
      className="formulario"
    >
      <ConfirmarAcao
        aberto={confirmando}
        titulo={t.trocarSenhaTitulo(conta.nome)}
        descricao={t.trocarSenhaDescricao}
        rotuloConfirmar={t.trocarSenha}
        aoConfirmar={enviar}
        aoCancelar={() => setConfirmando(false)}
      />
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {salva && <Alerta tipo="sucesso">{t.senhaRedefinida(conta.nome)}</Alerta>}
      <div>
        <label htmlFor={`${uid}-nova`}>{t.novaSenha}</label>
        <input
          id={`${uid}-nova`}
          type="password"
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          aria-describedby={`${uid}-nova-ajuda`}
        />
        <span id={`${uid}-nova-ajuda`} className="texto-apoio">
          {t.novaSenhaAjuda(TAMANHO_MINIMO_SENHA)}
        </span>
      </div>
      <div className="linha-acoes">
        <button type="submit" disabled={senha.length < TAMANHO_MINIMO_SENHA}>
          {t.salvarSenha}
        </button>
        <button type="button" className="secundario" onClick={aoConcluir}>
          {salva ? textos.geral.concluir : textos.geral.cancelar}
        </button>
      </div>
    </form>
  );
}

type Filtro = "TODOS" | "ATIVOS" | "DESATIVADOS";

function TelaContas() {
  const textos = useTextos().backOffice;
  const { t, servico } = useContas();
  const { dados: contas, erro, carregando, recarregar } = useRecurso(servico.listar, t.falhaCarregar);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const [emLote, setEmLote] = useState(false);
  const [editando, setEditando] = useState<Conta | null>(null);
  const [redefinindo, setRedefinindo] = useState<Conta | null>(null);
  const [desativando, setDesativando] = useState<Conta | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("TODOS");

  async function alternar(conta: Conta) {
    setErroAcao(null);
    setResultado(null);
    try {
      await servico.definirAtivo(conta.id, !conta.ativo);
      await recarregar();
      setResultado(conta.ativo ? t.foiDesativado(conta.nome) : t.foiReativado(conta.nome));
    } catch (excecao) {
      setErroAcao(mensagemDeErro(excecao, t.falhaAlterar));
    } finally {
      setDesativando(null);
    }
  }

  const ativos = contas?.filter((m) => m.ativo).length ?? 0;
  const desativados = (contas?.length ?? 0) - ativos;
  const termo = busca.trim().toLocaleLowerCase("pt-BR");
  const visiveis =
    contas?.filter(
      (m) =>
        (filtro === "TODOS" || (filtro === "ATIVOS") === m.ativo) &&
        (!termo || m.nome.toLocaleLowerCase("pt-BR").includes(termo) || m.login.toLocaleLowerCase("pt-BR").includes(termo)),
    ) ?? [];

  const FILTROS: { valor: Filtro; rotulo: string }[] = [
    { valor: "TODOS", rotulo: t.filtroTodos(contas?.length ?? 0) },
    { valor: "ATIVOS", rotulo: t.filtroAtivos(ativos) },
    { valor: "DESATIVADOS", rotulo: t.filtroDesativados(desativados) },
  ];

  return (
    <Pagina
      titulo={t.titulo}
      descricao={t.descricao}
      acoes={
        <>
          <button type="button" className="secundario" onClick={() => setEmLote(true)}>
            <Icone nome="usuarios" /> {t.cadastrarEmLote}
          </button>
          <button type="button" onClick={() => setCriando(true)}>
            <Icone nome="mais" /> {t.novo}
          </button>
        </>
      }
    >
      {(erro || erroAcao) && <Alerta tipo="erro">{erro ?? erroAcao}</Alerta>}
      {resultado && (
        <Alerta tipo="sucesso" aoFechar={() => setResultado(null)}>
          {resultado}
        </Alerta>
      )}

      <Painel className="sem-recuo">
        <div className="barra-filtros">
          <div className="campo-busca">
            <Icone nome="busca" />
            <input
              type="search"
              aria-label={t.buscarRotulo}
              placeholder={t.buscar}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <div className="segmentado" role="group" aria-label={t.filtrarSituacao}>
            {FILTROS.map((opcao) => (
              <button key={opcao.valor} type="button" aria-pressed={filtro === opcao.valor} onClick={() => setFiltro(opcao.valor)}>
                {opcao.rotulo}
              </button>
            ))}
          </div>
        </div>

        {carregando && (
          <div style={{ padding: "0 1.25rem" }}>
            <Carregando texto={t.carregando} />
          </div>
        )}

        {contas && contas.length === 0 && (
          <div style={{ padding: "1.25rem" }}>
            <Vazio icone="usuarios" titulo={t.nenhum}>
              {t.nenhumDica}
            </Vazio>
          </div>
        )}

        {contas && contas.length > 0 && visiveis.length === 0 && (
          <p className="texto-apoio" style={{ padding: "1rem 1.25rem" }} role="status">
            {t.nenhumFiltro}
          </p>
        )}

        {visiveis.length > 0 && (
          <div className="tabela-rolavel">
            <table className="tabela">
              <thead>
                <tr>
                  <th scope="col">{t.colunaConta}</th>
                  <th scope="col">{t.colunaSituacao}</th>
                  <th scope="col">{t.colunaCadastro}</th>
                  <th scope="col" className="coluna-acoes">
                    <span className="visualmente-oculto">{textos.geral.acoes}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((conta) => (
                  <tr key={conta.id}>
                    <td>
                      <div className="pessoa">
                        <Avatar nome={conta.nome} apagado={!conta.ativo} />
                        <span>
                          <strong>{conta.nome}</strong>
                          <span className="texto-apoio">{conta.login}</span>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`selo ${conta.ativo ? "selo-sucesso" : ""}`}>{conta.ativo ? t.ativo : t.desativado}</span>
                    </td>
                    <td>{formatarData(conta.criadoEm)}</td>
                    <td className="coluna-acoes">
                      <span className="acoes-linha">
                        <button
                          type="button"
                          className="fantasma compacto"
                          onClick={() => setEditando(conta)}
                          aria-label={t.editarRotulo(conta.nome)}
                        >
                          <Icone nome="lapis" /> {textos.geral.editar}
                        </button>
                        <button
                          type="button"
                          className="fantasma compacto"
                          onClick={() => setRedefinindo(conta)}
                          aria-label={t.senhaRotulo(conta.nome)}
                        >
                          <Icone nome="chave" /> {t.rotuloSenha}
                        </button>
                        <button
                          type="button"
                          className="fantasma compacto"
                          onClick={() => (conta.ativo ? setDesativando(conta) : alternar(conta))}
                          aria-label={t.acaoRotulo(conta.ativo ? t.desativar : t.reativar, conta.nome)}
                        >
                          <Icone nome={conta.ativo ? "pausa" : "check"} /> {conta.ativo ? t.desativar : t.reativar}
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Painel>

      <ConfirmarAcao
        aberto={desativando !== null}
        titulo={t.desativarTitulo(desativando?.nome ?? null)}
        descricao={t.desativarDescricao}
        rotuloConfirmar={t.confirmarDesativar}
        perigo
        aoConfirmar={() => desativando && alternar(desativando)}
        aoCancelar={() => setDesativando(null)}
      />

      <Gaveta aberta={criando} titulo={t.novo} aoFechar={() => setCriando(false)}>
        <NovaContaForm
          aoCriar={async (nome) => {
            setCriando(false);
            setResultado(t.foiCadastrado(nome));
            await recarregar();
          }}
        />
      </Gaveta>

      <Gaveta aberta={emLote} largura="larga" titulo={t.loteTitulo} descricao={t.loteDescricao} aoFechar={() => setEmLote(false)}>
        <LoteContas
          aoConcluir={async () => {
            await recarregar();
          }}
        />
      </Gaveta>

      <Gaveta aberta={editando !== null} titulo={t.editarTitulo(editando?.nome ?? "")} aoFechar={() => setEditando(null)}>
        {editando && (
          <EditarForm
            conta={editando}
            aoConcluir={async () => {
              setResultado(t.dadosAtualizados(editando.nome));
              setEditando(null);
              await recarregar();
            }}
          />
        )}
      </Gaveta>

      <Gaveta aberta={redefinindo !== null} titulo={t.senhaRotulo(redefinindo?.nome ?? "")} aoFechar={() => setRedefinindo(null)}>
        {redefinindo && <NovaSenhaForm conta={redefinindo} aoConcluir={() => setRedefinindo(null)} />}
      </Gaveta>
    </Pagina>
  );
}

/**
 * Cadastro de contas operacionais pelo administrador: contas da empresa (HU23, HU26, HU27) e funcionários da
 * companhia aérea (HU33). Desativar (ou trocar a senha) derruba também as sessões já abertas, mas não apaga nada: o
 * que a pessoa registrou continua apontando para ela.
 */
export function CadastroContas({ servico, textos }: { servico: ServicoContas; textos: TextosContas }) {
  return (
    <ContextoContas.Provider value={{ servico, t: textos }}>
      <TelaContas />
    </ContextoContas.Provider>
  );
}
