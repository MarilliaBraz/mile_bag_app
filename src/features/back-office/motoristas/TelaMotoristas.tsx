import { useId, useState } from "react";
import { formatarData, mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { ConfirmarAcao } from "../../../shared/ui/ConfirmarAcao";
import { LoteMotoristas } from "./LoteMotoristas";
import {
  criarMotorista,
  definirAtivoMotorista,
  listarMotoristas,
  redefinirSenhaMotorista,
  atualizarMotorista,
  type Motorista,
} from "./motoristasApi";
import { Alerta, Carregando, Vazio } from "../../../shared/ui/Alerta";
import { Icone } from "../../../shared/ui/Icone";
import { Avatar, Gaveta, Pagina, Painel } from "../layout/Pagina";

const TAMANHO_MINIMO_SENHA = 8;

function NovoMotoristaForm({ aoCriar }: { aoCriar: (nome: string) => Promise<void> }) {
  const uid = useId();
  const [nome, setNome] = useState("");
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await criarMotorista({ nome: nome.trim(), login: login.trim(), senha });
      await aoCriar(nome.trim());
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, "Não foi possível cadastrar o motorista."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="formulario">
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      <div>
        <label htmlFor={`${uid}-nome`}>Nome completo</label>
        <input id={`${uid}-nome`} autoComplete="off" value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div>
        <label htmlFor={`${uid}-login`}>Login</label>
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
          O que o motorista digita para entrar. Pode ser um e-mail.
        </span>
      </div>
      <div>
        <label htmlFor={`${uid}-senha`}>Senha inicial</label>
        <input
          id={`${uid}-senha`}
          type="password"
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          aria-describedby={`${uid}-senha-ajuda`}
        />
        <span id={`${uid}-senha-ajuda`} className="texto-apoio">
          Mínimo de {TAMANHO_MINIMO_SENHA} caracteres. Entregue ao motorista junto com o login.
        </span>
      </div>
      <button type="submit" className="bloco" disabled={!nome.trim() || !login.trim() || senha.length < TAMANHO_MINIMO_SENHA || salvando}>
        {salvando ? "Cadastrando…" : "Cadastrar motorista"}
      </button>
    </form>
  );
}

function EditarForm({ motorista, aoConcluir }: { motorista: Motorista; aoConcluir: () => Promise<void> }) {
  const uid = useId();
  const [nome, setNome] = useState(motorista.nome);
  const [login, setLogin] = useState(motorista.login);
  const [erro, setErro] = useState<string | null>(null);

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
      setErro(mensagemDeErro(excecao, "Não foi possível salvar as alterações."));
    }
  }

  return (
    <form onSubmit={enviar} className="formulario">
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      <div>
        <label htmlFor={`${uid}-nome`}>Nome</label>
        <input id={`${uid}-nome`} value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div>
        <label htmlFor={`${uid}-login`}>Login</label>
        <input id={`${uid}-login`} autoCapitalize="none" value={login} onChange={(e) => setLogin(e.target.value)} />
      </div>
      {loginMudou && (
        <Alerta tipo="aviso">
          O motorista passa a entrar com o login novo. Um pedido de redefinição de senha que estava pendente é cancelado.
        </Alerta>
      )}
      <button type="submit" className="bloco" disabled={!nomeMudou && !loginMudou}>
        Salvar alterações
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

  async function enviar() {
    setErro(null);
    try {
      await redefinirSenhaMotorista(motorista.id, senha);
      setSenha("");
      setSalva(true);
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, "Não foi possível redefinir a senha."));
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
        titulo={`Trocar a senha de ${motorista.nome}?`}
        descricao="As sessões abertas deste motorista serão encerradas e ele precisará entrar de novo com a senha nova."
        rotuloConfirmar="Trocar senha"
        aoConfirmar={enviar}
        aoCancelar={() => setConfirmando(false)}
      />
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {salva && <Alerta tipo="sucesso">Senha redefinida. Avise {motorista.nome} da senha nova.</Alerta>}
      <div>
        <label htmlFor={`${uid}-nova`}>Nova senha</label>
        <input
          id={`${uid}-nova`}
          type="password"
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          aria-describedby={`${uid}-nova-ajuda`}
        />
        <span id={`${uid}-nova-ajuda`} className="texto-apoio">
          Mínimo de {TAMANHO_MINIMO_SENHA} caracteres. As sessões abertas dele serão encerradas.
        </span>
      </div>
      <div className="linha-acoes">
        <button type="submit" disabled={senha.length < TAMANHO_MINIMO_SENHA}>
          Salvar senha
        </button>
        <button type="button" className="secundario" onClick={aoConcluir}>
          {salva ? "Concluir" : "Cancelar"}
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
  const { dados: motoristas, erro, carregando, recarregar } = useRecurso(listarMotoristas, "Não foi possível carregar os motoristas.");
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
      setResultado(motorista.ativo ? `${motorista.nome} foi desativado.` : `${motorista.nome} foi reativado.`);
    } catch (excecao) {
      setErroAcao(mensagemDeErro(excecao, "Não foi possível alterar o motorista."));
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
    { valor: "TODOS", rotulo: `Todos (${motoristas?.length ?? 0})` },
    { valor: "ATIVOS", rotulo: `Ativos (${ativos})` },
    { valor: "DESATIVADOS", rotulo: `Desativados (${desativados})` },
  ];

  return (
    <Pagina
      titulo="Motoristas"
      descricao="Quem faz as entregas da sua empresa. Desativar encerra as sessões do motorista, mas mantém as entregas e ajustes dele."
      acoes={
        <>
          <button type="button" className="secundario" onClick={() => setEmLote(true)}>
            <Icone nome="usuarios" /> Cadastrar em lote
          </button>
          <button type="button" onClick={() => setCriando(true)}>
            <Icone nome="mais" /> Novo motorista
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
              aria-label="Buscar motorista por nome ou login"
              placeholder="Buscar por nome ou login"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <div className="segmentado" role="group" aria-label="Filtrar por situação">
            {FILTROS.map((opcao) => (
              <button key={opcao.valor} type="button" aria-pressed={filtro === opcao.valor} onClick={() => setFiltro(opcao.valor)}>
                {opcao.rotulo}
              </button>
            ))}
          </div>
        </div>

        {carregando && (
          <div style={{ padding: "0 1.25rem" }}>
            <Carregando texto="Carregando motoristas…" />
          </div>
        )}

        {motoristas && motoristas.length === 0 && (
          <div style={{ padding: "1.25rem" }}>
            <Vazio icone="usuarios" titulo="Nenhum motorista cadastrado">
              Use “Novo motorista” ou “Cadastrar em lote” para começar.
            </Vazio>
          </div>
        )}

        {motoristas && motoristas.length > 0 && visiveis.length === 0 && (
          <p className="texto-apoio" style={{ padding: "1rem 1.25rem" }} role="status">
            Nenhum motorista encontrado com esse filtro.
          </p>
        )}

        {visiveis.length > 0 && (
          <div className="tabela-rolavel">
            <table className="tabela">
              <thead>
                <tr>
                  <th scope="col">Motorista</th>
                  <th scope="col">Situação</th>
                  <th scope="col">Cadastrado em</th>
                  <th scope="col" className="coluna-acoes">
                    <span className="visualmente-oculto">Ações</span>
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
                      <span className={`selo ${motorista.ativo ? "selo-sucesso" : ""}`}>{motorista.ativo ? "Ativo" : "Desativado"}</span>
                    </td>
                    <td>{formatarData(motorista.criadoEm)}</td>
                    <td className="coluna-acoes">
                      <span className="acoes-linha">
                        <button
                          type="button"
                          className="fantasma compacto"
                          onClick={() => setEditando(motorista)}
                          aria-label={`Editar ${motorista.nome}`}
                        >
                          <Icone nome="lapis" /> Editar
                        </button>
                        <button
                          type="button"
                          className="fantasma compacto"
                          onClick={() => setRedefinindo(motorista)}
                          aria-label={`Nova senha para ${motorista.nome}`}
                        >
                          <Icone nome="chave" /> Senha
                        </button>
                        <button
                          type="button"
                          className="fantasma compacto"
                          onClick={() => (motorista.ativo ? setDesativando(motorista) : alternar(motorista))}
                          aria-label={`${motorista.ativo ? "Desativar" : "Reativar"} ${motorista.nome}`}
                        >
                          <Icone nome={motorista.ativo ? "pausa" : "check"} /> {motorista.ativo ? "Desativar" : "Reativar"}
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
        titulo={`Desativar ${desativando?.nome ?? "motorista"}?`}
        descricao="As sessões abertas deste motorista serão encerradas e ele não conseguirá mais entrar. As entregas e ajustes dele são mantidos, e você pode reativá-lo depois."
        rotuloConfirmar="Desativar motorista"
        perigo
        aoConfirmar={() => desativando && alternar(desativando)}
        aoCancelar={() => setDesativando(null)}
      />

      <Gaveta aberta={criando} titulo="Novo motorista" aoFechar={() => setCriando(false)}>
        <NovoMotoristaForm
          aoCriar={async (nome) => {
            setCriando(false);
            setResultado(`${nome} foi cadastrado.`);
            await recarregar();
          }}
        />
      </Gaveta>

      <Gaveta
        aberta={emLote}
        largura="larga"
        titulo="Cadastrar vários motoristas"
        descricao="Cole uma linha por motorista. Cada linha é tratada separadamente: as com erro aparecem com o motivo e as outras são criadas."
        aoFechar={() => setEmLote(false)}
      >
        <LoteMotoristas
          aoConcluir={async () => {
            await recarregar();
          }}
        />
      </Gaveta>

      <Gaveta aberta={editando !== null} titulo={`Editar ${editando?.nome ?? ""}`} aoFechar={() => setEditando(null)}>
        {editando && (
          <EditarForm
            motorista={editando}
            aoConcluir={async () => {
              setResultado(`Dados de ${editando.nome} atualizados.`);
              setEditando(null);
              await recarregar();
            }}
          />
        )}
      </Gaveta>

      <Gaveta aberta={redefinindo !== null} titulo={`Nova senha para ${redefinindo?.nome ?? ""}`} aoFechar={() => setRedefinindo(null)}>
        {redefinindo && <NovaSenhaForm motorista={redefinindo} aoConcluir={() => setRedefinindo(null)} />}
      </Gaveta>
    </Pagina>
  );
}
