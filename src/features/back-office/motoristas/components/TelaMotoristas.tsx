import { useId, useState } from "react";
import { formatarData, mensagemDeErro } from "../../../../shared/utils/formatar";
import { useRecurso } from "../../../../shared/hooks/useRecurso";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { ConfirmarAcao } from "../../../../shared/components/ConfirmarAcao";
import { LoteMotoristas } from "./LoteMotoristas";
import {
  criarMotorista,
  definirAtivoMotorista,
  listarMotoristas,
  redefinirSenhaMotorista,
  atualizarMotorista,
} from "../../../../shared/services/motoristasService";
import type { Motorista } from "../../../../shared/types/motoristas";
import { Alerta, Carregando, Vazio } from "../../../../shared/components/Alerta";
import { Icone } from "../../../../shared/components/Icone";
import { Avatar, Gaveta, Pagina, Painel } from "../../../../shared/components/Pagina";

const TAMANHO_MINIMO_SENHA = 8;

function NovoMotoristaForm({ aoCriar }: { aoCriar: (nome: string) => Promise<void> }) {
  const uid = useId();
  const [nome, setNome] = useState("");
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const t = useTextos().backOffice.motoristas;

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await criarMotorista({ nome: nome.trim(), login: login.trim(), senha });
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

function EditarForm({ motorista, aoConcluir }: { motorista: Motorista; aoConcluir: () => Promise<void> }) {
  const uid = useId();
  const [nome, setNome] = useState(motorista.nome);
  const [login, setLogin] = useState(motorista.login);
  const [erro, setErro] = useState<string | null>(null);
  const textos = useTextos().backOffice;
  const t = textos.motoristas;

  const nomeMudou = nome.trim() !== "" && nome.trim() !== motorista.nome;
  const loginMudou = login.trim() !== "" && login.trim() !== motorista.login;

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    try {
      await atualizarMotorista(motorista.id, {
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

function NovaSenhaForm({ motorista, aoConcluir }: { motorista: Motorista; aoConcluir: () => void }) {
  const uid = useId();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salva, setSalva] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const textos = useTextos().backOffice;
  const t = textos.motoristas;

  async function enviar() {
    setErro(null);
    try {
      await redefinirSenhaMotorista(motorista.id, senha);
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
        titulo={t.trocarSenhaTitulo(motorista.nome)}
        descricao={t.trocarSenhaDescricao}
        rotuloConfirmar={t.trocarSenha}
        aoConfirmar={enviar}
        aoCancelar={() => setConfirmando(false)}
      />
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {salva && <Alerta tipo="sucesso">{t.senhaRedefinida(motorista.nome)}</Alerta>}
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

/**
 * Motoristas da empresa (HU23). Desativar (ou trocar a senha) derruba também as sessões
 * já abertas, mas não apaga nada: as entregas e ajustes do motorista continuam
 * apontando para ele.
 */
export function TelaMotoristas() {
  const textos = useTextos().backOffice;
  const t = textos.motoristas;
  const { dados: motoristas, erro, carregando, recarregar } = useRecurso(listarMotoristas, t.falhaCarregar);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const [emLote, setEmLote] = useState(false);
  const [editando, setEditando] = useState<Motorista | null>(null);
  const [redefinindo, setRedefinindo] = useState<Motorista | null>(null);
  const [desativando, setDesativando] = useState<Motorista | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("TODOS");

  async function alternar(motorista: Motorista) {
    setErroAcao(null);
    setResultado(null);
    try {
      await definirAtivoMotorista(motorista.id, !motorista.ativo);
      await recarregar();
      setResultado(motorista.ativo ? t.foiDesativado(motorista.nome) : t.foiReativado(motorista.nome));
    } catch (excecao) {
      setErroAcao(mensagemDeErro(excecao, t.falhaAlterar));
    } finally {
      setDesativando(null);
    }
  }

  const ativos = motoristas?.filter((m) => m.ativo).length ?? 0;
  const desativados = (motoristas?.length ?? 0) - ativos;
  const termo = busca.trim().toLocaleLowerCase("pt-BR");
  const visiveis =
    motoristas?.filter(
      (m) =>
        (filtro === "TODOS" || (filtro === "ATIVOS") === m.ativo) &&
        (!termo || m.nome.toLocaleLowerCase("pt-BR").includes(termo) || m.login.toLocaleLowerCase("pt-BR").includes(termo)),
    ) ?? [];

  const FILTROS: { valor: Filtro; rotulo: string }[] = [
    { valor: "TODOS", rotulo: t.filtroTodos(motoristas?.length ?? 0) },
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
            <Icone nome="mais" /> {t.novoMotorista}
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

        {motoristas && motoristas.length === 0 && (
          <div style={{ padding: "1.25rem" }}>
            <Vazio icone="usuarios" titulo={t.nenhum}>
              {t.nenhumDica}
            </Vazio>
          </div>
        )}

        {motoristas && motoristas.length > 0 && visiveis.length === 0 && (
          <p className="texto-apoio" style={{ padding: "1rem 1.25rem" }} role="status">
            {t.nenhumFiltro}
          </p>
        )}

        {visiveis.length > 0 && (
          <div className="tabela-rolavel">
            <table className="tabela">
              <thead>
                <tr>
                  <th scope="col">{t.colunaMotorista}</th>
                  <th scope="col">{t.colunaSituacao}</th>
                  <th scope="col">{t.colunaCadastro}</th>
                  <th scope="col" className="coluna-acoes">
                    <span className="visualmente-oculto">{textos.geral.acoes}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((motorista) => (
                  <tr key={motorista.id}>
                    <td>
                      <div className="pessoa">
                        <Avatar nome={motorista.nome} apagado={!motorista.ativo} />
                        <span>
                          <strong>{motorista.nome}</strong>
                          <span className="texto-apoio">{motorista.login}</span>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`selo ${motorista.ativo ? "selo-sucesso" : ""}`}>{motorista.ativo ? t.ativo : t.desativado}</span>
                    </td>
                    <td>{formatarData(motorista.criadoEm)}</td>
                    <td className="coluna-acoes">
                      <span className="acoes-linha">
                        <button
                          type="button"
                          className="fantasma compacto"
                          onClick={() => setEditando(motorista)}
                          aria-label={t.editarRotulo(motorista.nome)}
                        >
                          <Icone nome="lapis" /> {textos.geral.editar}
                        </button>
                        <button
                          type="button"
                          className="fantasma compacto"
                          onClick={() => setRedefinindo(motorista)}
                          aria-label={t.senhaRotulo(motorista.nome)}
                        >
                          <Icone nome="chave" /> {t.rotuloSenha}
                        </button>
                        <button
                          type="button"
                          className="fantasma compacto"
                          onClick={() => (motorista.ativo ? setDesativando(motorista) : alternar(motorista))}
                          aria-label={t.acaoRotulo(motorista.ativo ? t.desativar : t.reativar, motorista.nome)}
                        >
                          <Icone nome={motorista.ativo ? "pausa" : "check"} /> {motorista.ativo ? t.desativar : t.reativar}
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
        rotuloConfirmar={t.desativarMotorista}
        perigo
        aoConfirmar={() => desativando && alternar(desativando)}
        aoCancelar={() => setDesativando(null)}
      />

      <Gaveta aberta={criando} titulo={t.novoMotorista} aoFechar={() => setCriando(false)}>
        <NovoMotoristaForm
          aoCriar={async (nome) => {
            setCriando(false);
            setResultado(t.foiCadastrado(nome));
            await recarregar();
          }}
        />
      </Gaveta>

      <Gaveta aberta={emLote} largura="larga" titulo={t.loteTitulo} descricao={t.loteDescricao} aoFechar={() => setEmLote(false)}>
        <LoteMotoristas
          aoConcluir={async () => {
            await recarregar();
          }}
        />
      </Gaveta>

      <Gaveta aberta={editando !== null} titulo={t.editarTitulo(editando?.nome ?? "")} aoFechar={() => setEditando(null)}>
        {editando && (
          <EditarForm
            motorista={editando}
            aoConcluir={async () => {
              setResultado(t.dadosAtualizados(editando.nome));
              setEditando(null);
              await recarregar();
            }}
          />
        )}
      </Gaveta>

      <Gaveta aberta={redefinindo !== null} titulo={t.senhaRotulo(redefinindo?.nome ?? "")} aoFechar={() => setRedefinindo(null)}>
        {redefinindo && <NovaSenhaForm motorista={redefinindo} aoConcluir={() => setRedefinindo(null)} />}
      </Gaveta>
    </Pagina>
  );
}
