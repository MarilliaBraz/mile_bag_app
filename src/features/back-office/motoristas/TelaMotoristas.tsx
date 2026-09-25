import { Ajuda } from "../../../shared/ui/Ajuda";
import { useId, useState } from "react";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { ConfirmarAcao } from "../../../shared/ui/ConfirmarAcao";
import { LoteMotoristas } from "./LoteMotoristas";
import { criarMotorista, definirAtivoMotorista, listarMotoristas, redefinirSenhaMotorista, atualizarMotorista, type Motorista } from "./motoristasApi";

const TAMANHO_MINIMO_SENHA = 8;

function NovoMotoristaForm({ aoCriar }: { aoCriar: () => Promise<void> }) {
  const uid = useId();
  const [nome, setNome] = useState("");
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [criado, setCriado] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setCriado(false);
    setSalvando(true);
    try {
      await criarMotorista({ nome: nome.trim(), login: login.trim(), senha });
      setNome("");
      setLogin("");
      setSenha("");
      setCriado(true);
      await aoCriar();
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, "Não foi possível cadastrar o motorista."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={enviar} style={{ display: "grid", gap: "0.75rem", maxWidth: 420 }}>
      {erro && (
        <p role="alert" style={{ color: "var(--erro)", margin: 0 }}>
          {erro}
        </p>
      )}
      <div>
        <label htmlFor={`${uid}-nome`}>Nome</label>
        <input id={`${uid}-nome`} value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div>
        <label htmlFor={`${uid}-login`}>Login (o que o motorista digita para entrar)</label>
        <input id={`${uid}-login`} autoCapitalize="none" value={login} onChange={(e) => setLogin(e.target.value)} />
      </div>
      <div>
        <label htmlFor={`${uid}-senha`}>Senha inicial (mínimo {TAMANHO_MINIMO_SENHA} caracteres)</label>
        <input id={`${uid}-senha`} type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
      </div>
      <div>
        <button type="submit" disabled={!nome.trim() || !login.trim() || senha.length < TAMANHO_MINIMO_SENHA || salvando}>
          {salvando ? "Cadastrando…" : "Cadastrar motorista"}
        </button>
        {criado && (
          <span role="status" style={{ marginLeft: "0.75rem", color: "var(--confirmacao)" }}>
            Motorista cadastrado.
          </span>
        )}
      </div>
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
    <form onSubmit={enviar} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "end", marginTop: "0.5rem" }}>
      <div>
        <label htmlFor={`${uid}-nome`}>Nome</label>
        <input id={`${uid}-nome`} value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div>
        <label htmlFor={`${uid}-login`}>Login</label>
        <input id={`${uid}-login`} autoCapitalize="none" value={login} onChange={(e) => setLogin(e.target.value)} />
      </div>
      <button type="submit" disabled={!nomeMudou && !loginMudou}>
        Salvar
      </button>
      {loginMudou && (
        <span className="texto-apoio" style={{ flexBasis: "100%" }}>
          O motorista passa a entrar com o login novo. Um pedido de redefinição de senha que estava pendente é cancelado.
        </span>
      )}
      {erro && (
        <span role="alert" style={{ color: "var(--erro)" }}>
          {erro}
        </span>
      )}
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
    <form onSubmit={(evento) => { evento.preventDefault(); setConfirmando(true); }} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "end", marginTop: "0.5rem" }}>
      <ConfirmarAcao
        aberto={confirmando}
        titulo={`Trocar a senha de ${motorista.nome}?`}
        descricao="As sessões abertas deste motorista serão encerradas e ele precisará entrar de novo com a senha nova."
        rotuloConfirmar="Trocar senha"
        aoConfirmar={enviar}
        aoCancelar={() => setConfirmando(false)}
      />
      <div>
        <label htmlFor={`${uid}-nova`}>Nova senha de {motorista.nome}</label>
        <input id={`${uid}-nova`} type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
      </div>
      <button type="submit" disabled={senha.length < TAMANHO_MINIMO_SENHA}>
        Salvar senha
      </button>
      <button type="button" className="secundario" onClick={aoConcluir}>
        Fechar
      </button>
      {erro && (
        <span role="alert" style={{ color: "var(--erro)" }}>
          {erro}
        </span>
      )}
      {salva && (
        <span role="status" style={{ color: "var(--confirmacao)" }}>
          Senha redefinida.
        </span>
      )}
    </form>
  );
}

/**
 * Motoristas da empresa (HU23). Desativar (ou trocar a senha) derruba também as sessões
 * já abertas, mas não apaga nada: as entregas e ajustes do motorista continuam
 * apontando para ele.
 */
export function TelaMotoristas() {
  const { dados: motoristas, erro, carregando, recarregar } = useRecurso(listarMotoristas, "Não foi possível carregar os motoristas.");
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [redefinindo, setRedefinindo] = useState<string | null>(null);
  const [renomeando, setRenomeando] = useState<string | null>(null);
  const [desativando, setDesativando] = useState<Motorista | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);

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

  return (
    <main>
      <h1>Motoristas</h1>
      <Ajuda>
        <p>Cadastre quem faz as entregas. Desativar um motorista encerra as sessões dele, mas mantém entregas e ajustes. Para trocar o acesso, use “Nova senha”. Para muitos motoristas de uma vez, use o cadastro em lote no fim da página.</p>
      </Ajuda>

      {(erro || erroAcao) && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {erro ?? erroAcao}
        </p>
      )}
      {resultado && (
        <p role="status" style={{ color: "var(--confirmacao)" }}>
          {resultado}
        </p>
      )}
      {carregando && <p role="status">Carregando…</p>}
      {motoristas && motoristas.length === 0 && <p>Nenhum motorista cadastrado.</p>}

      {motoristas && motoristas.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {motoristas.map((motorista) => (
            <li key={motorista.id} style={{ border: "1px solid var(--borda)", borderRadius: 8, padding: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "0.5rem" }}>
                <div>
                  <strong>{motorista.nome}</strong> {!motorista.ativo && <span style={{ color: "var(--aviso)" }}>· desativado</span>}
                  <div className="texto-apoio">Login: {motorista.login}</div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button type="button" className="secundario" onClick={() => setRenomeando(renomeando === motorista.id ? null : motorista.id)}>
                    Editar
                  </button>
                  <button type="button" className="secundario" onClick={() => setRedefinindo(redefinindo === motorista.id ? null : motorista.id)}>
                    Nova senha
                  </button>
                  <button type="button" className="secundario" onClick={() => (motorista.ativo ? setDesativando(motorista) : alternar(motorista))}>
                    {motorista.ativo ? "Desativar" : "Reativar"}
                  </button>
                </div>
              </div>
              {renomeando === motorista.id && (
                <EditarForm
                  motorista={motorista}
                  aoConcluir={async () => {
                    setRenomeando(null);
                    await recarregar();
                  }}
                />
              )}
              {redefinindo === motorista.id && <NovaSenhaForm motorista={motorista} aoConcluir={() => setRedefinindo(null)} />}
            </li>
          ))}
        </ul>
      )}

      <ConfirmarAcao
        aberto={desativando !== null}
        titulo={`Desativar ${desativando?.nome ?? "motorista"}?`}
        descricao="As sessões abertas deste motorista serão encerradas e ele não conseguirá mais entrar. As entregas e ajustes dele são mantidos, e você pode reativá-lo depois."
        rotuloConfirmar="Desativar motorista"
        perigo
        aoConfirmar={() => desativando && alternar(desativando)}
        aoCancelar={() => setDesativando(null)}
      />

      <section style={{ marginTop: "2rem" }}>
        <h2>Novo motorista</h2>
        <NovoMotoristaForm aoCriar={recarregar} />
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Cadastrar vários de uma vez</h2>
        <LoteMotoristas aoConcluir={async () => { await recarregar(); }} />
      </section>
    </main>
  );
}
