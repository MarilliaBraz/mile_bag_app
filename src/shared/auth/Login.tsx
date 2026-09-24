import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { requisitar } from "../api/httpClient";
import { mensagemDeErro } from "../format/formatar";
import { definirToken, obterPapel, obterToken, rotaInicialDo, type Papel } from "./authStorage";

/** Espelha AutenticacaoController.LoginResponse. */
type Sessao = { token: string; papel: Papel };

/** Entrada por login e senha (HU22): o servidor devolve o JWT e o papel decide para onde ir. */
export function Login() {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  if (obterToken() && obterPapel()) {
    return <Navigate to={rotaInicialDo(obterPapel())} replace />;
  }

  async function entrar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEntrando(true);
    try {
      const sessao = await requisitar<Sessao>("/api/v1/auth/login", { metodo: "POST", corpo: { login: login.trim(), senha } });
      definirToken(sessao.token);
      navigate(rotaInicialDo(sessao.papel), { replace: true });
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, "Não foi possível entrar. Verifique a conexão e tente de novo."));
    } finally {
      setEntrando(false);
    }
  }

  return (
    <main style={{ maxWidth: 380, margin: "3rem auto", padding: "0 1rem" }}>
      <h1>Milebag</h1>
      <form onSubmit={entrar} style={{ display: "grid", gap: "0.75rem" }}>
        {erro && (
          <p role="alert" style={{ color: "var(--erro)", margin: 0 }}>
            {erro}
          </p>
        )}
        <div>
          <label htmlFor="login">Login</label>
          <input id="login" autoComplete="username" autoCapitalize="none" value={login} onChange={(e) => setLogin(e.target.value)} autoFocus />
        </div>
        <div>
          <label htmlFor="senha">Senha</label>
          <input id="senha" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        </div>
        <div>
          <button type="submit" disabled={!login.trim() || !senha || entrando}>
            {entrando ? "Entrando…" : "Entrar"}
          </button>
        </div>
      </form>
      <p>
        <Link to="/esqueci-senha">Esqueci minha senha</Link>
      </p>
    </main>
  );
}
