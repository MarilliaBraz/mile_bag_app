import { Ajuda } from "../ui/Ajuda";
import { Alerta } from "../ui/Alerta";
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
  const [mostrarSenha, setMostrarSenha] = useState(false);

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
    <div className="tela-entrada">
      <main>
        <div className="marca">
          <img src="/icone-app.svg" alt="" /> Milebag
        </div>
        <h1>Entrar</h1>
        <p className="texto-apoio">Use o login e a senha que a sua empresa informou.</p>
        <form onSubmit={entrar} className="cartao formulario" style={{ marginTop: "1rem" }}>
          {erro && (
            <Alerta id="login-erro" tipo="erro" className="sem-margem">
              {erro}
            </Alerta>
          )}
          <div>
            <label htmlFor="login">Login</label>
            <input id="login" aria-invalid={!!erro} aria-describedby={erro ? "login-erro" : undefined} autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={login} onChange={(e) => setLogin(e.target.value)} autoFocus />
          </div>
          <div>
            <label htmlFor="senha">Senha</label>
            <div style={{ position: "relative" }}>
              <input id="senha" type={mostrarSenha ? "text" : "password"} aria-invalid={!!erro} aria-describedby={erro ? "login-erro" : undefined} autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} style={{ paddingRight: "5.5rem" }} />
              <button type="button" className="fantasma" onClick={() => setMostrarSenha((v) => !v)} aria-pressed={mostrarSenha} style={{ position: "absolute", right: 2, top: 2, bottom: 2, minHeight: 0, padding: "0 0.75rem" }}>
                {mostrarSenha ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>
          <button type="submit" className="grande bloco" disabled={!login.trim() || !senha || entrando}>
            {entrando ? "Entrando…" : "Entrar"}
          </button>
          <Link to="/esqueci-senha" style={{ textAlign: "center" }}>
            Esqueci minha senha
          </Link>
        </form>
        <Ajuda titulo="Não consegue entrar?">
          <p>Confira se o login está escrito igual ao que recebeu e se a tecla Caps Lock está desligada. Se esqueceu a senha, use “Esqueci minha senha”. Se o problema continuar, fale com o administrador da sua empresa.</p>
        </Ajuda>
        <PreferenciasAcessibilidade />
      </main>
    </div>
  );
}
