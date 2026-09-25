import { Ajuda } from "../ui/Ajuda";
import { PreferenciasAcessibilidade } from "../ui/PreferenciasAcessibilidade";
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
      <p>Entre com o login e a senha que a sua empresa informou.</p>
      <form onSubmit={entrar} style={{ display: "grid", gap: "0.75rem" }}>
        {erro && (
          <p id="login-erro" role="alert" style={{ color: "var(--erro)", margin: 0 }}>
            {erro}
          </p>
        )}
        <div>
          <label htmlFor="login">Login</label>
          <input id="login" aria-invalid={!!erro} aria-describedby={erro ? "login-erro" : undefined} autoComplete="username" autoCapitalize="none" value={login} onChange={(e) => setLogin(e.target.value)} autoFocus />
        </div>
        <div>
          <label htmlFor="senha">Senha</label>
          <input id="senha" type="password" aria-invalid={!!erro} aria-describedby={erro ? "login-erro" : undefined} autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
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
      <Ajuda titulo="Não consegue entrar?">
        <p>Confira se o login está escrito igual ao que recebeu e se a tecla Caps Lock está desligada. Se esqueceu a senha, use “Esqueci minha senha”. Se o problema continuar, fale com o administrador da sua empresa.</p>
      </Ajuda>
      <PreferenciasAcessibilidade />
    </main>
  );
}
