import { useId, useState } from "react";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
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

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await criarMotorista({ nome: nome.trim(), login: login.trim(), senha });
      setNome("");
      setLogin("");
      setSenha("");
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
        <span style={{ fontSize: "0.85rem", flexBasis: "100%" }}>
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

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    try {
      await redefinirSenhaMotorista(motorista.id, senha);
      setSenha("");
      setSalva(true);
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, "Não foi possível redefinir a senha."));
    }
  }

  return (
    <form onSubmit={enviar} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "end", marginTop: "0.5rem" }}>
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

  async function alternar(motorista: Motorista) {
    setErroAcao(null);
    try {
      await definirAtivoMotorista(motorista.id, !motorista.ativo);
      await recarregar();
    } catch (excecao) {
      setErroAcao(mensagemDeErro(excecao, "Não foi possível alterar o motorista."));
    }
  }

  return (
    <main>
      <h1>Motoristas</h1>

      {(erro || erroAcao) && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {erro ?? erroAcao}
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
                  <div style={{ fontSize: "0.9rem" }}>Login: {motorista.login}</div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button type="button" className="secundario" onClick={() => setRenomeando(renomeando === motorista.id ? null : motorista.id)}>
                    Editar
                  </button>
                  <button type="button" className="secundario" onClick={() => setRedefinindo(redefinindo === motorista.id ? null : motorista.id)}>
                    Nova senha
                  </button>
                  <button type="button" className="secundario" onClick={() => alternar(motorista)}>
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
