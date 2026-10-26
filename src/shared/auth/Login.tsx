import { Ajuda } from "../ui/Ajuda";
import { Alerta } from "../ui/Alerta";
import { Icone } from "../ui/Icone";
import { PreferenciasAcessibilidade } from "../ui/PreferenciasAcessibilidade";
import { SeletorIdioma } from "../ui/SeletorIdioma";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { requisitar } from "../api/httpClient";
import { mensagemDeErro } from "../format/formatar";
import { useTextos } from "../i18n/idioma";
import { definirToken, obterPapel, obterToken, rotaInicialDo, tokenExpirado, type EstadoLogin, type Papel } from "./authStorage";

/** Espelha AutenticacaoController.LoginResponse. */
type Sessao = { token: string; papel: Papel };

/** Volta para a tela onde a sessão expirou, desde que seja da área do papel que entrou. */
function destinoDepoisDeEntrar(papel: Papel, voltarPara: string | undefined): string {
  const inicial = rotaInicialDo(papel);
  return voltarPara?.startsWith(inicial) ? voltarPara : inicial;
}

/** Entrada por login e senha (HU22): o servidor devolve o JWT e o papel decide para onde ir. */
export function Login() {
  const navigate = useNavigate();
  const t = useTextos().login;
  const estado = (useLocation().state ?? {}) as EstadoLogin;
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  if (obterToken() && !tokenExpirado() && obterPapel()) {
    return <Navigate to={rotaInicialDo(obterPapel())} replace />;
  }

  async function entrar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEntrando(true);
    try {
      const sessao = await requisitar<Sessao>("/api/v1/auth/login", { metodo: "POST", corpo: { login: login.trim(), senha } });
      definirToken(sessao.token);
      navigate(destinoDepoisDeEntrar(sessao.papel, estado.voltarPara), { replace: true });
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaAoEntrar));
    } finally {
      setEntrando(false);
    }
  }

  return (
    <div className="tela-entrada com-marca">
      {/* Painel da marca: só no computador (no celular o formulário vem primeiro, sem rolagem). */}
      <aside className="entrada-marca" aria-hidden="true">
        <span className="marca">
          <img src="/icone-app.svg" alt="" /> Milebag
        </span>
        <div>
          <h2>{t.slogan}</h2>
          <ul>
            <li>
              <Icone nome="camera" /> {t.destaqueBdo}
            </li>
            <li>
              <Icone nome="rota" /> {t.destaqueRota}
            </li>
            <li>
              <Icone nome="checkCirculo" /> {t.destaqueComprovante}
            </li>
          </ul>
        </div>
        <span>{t.subtitulo}</span>
      </aside>
      <main>
        <div className="entrada-idioma">
          <SeletorIdioma />
        </div>
        <div className="marca">
          <img src="/icone-app.svg" alt="" /> Milebag
        </div>
        <h1>{t.titulo}</h1>
        <p className="texto-apoio">{t.instrucao}</p>
        <form onSubmit={entrar} className="cartao formulario mt-4">
          {estado.sessaoExpirada && !erro && (
            <Alerta tipo="aviso" className="sem-margem">
              {t.sessaoExpirada}
            </Alerta>
          )}
          {erro && (
            <Alerta id="login-erro" tipo="erro" className="sem-margem">
              {erro}
            </Alerta>
          )}
          <div>
            <label htmlFor="login">{t.login}</label>
            <input
              id="login"
              aria-invalid={!!erro}
              aria-describedby={erro ? "login-erro" : undefined}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="senha">{t.senha}</label>
            <div className="campo-senha">
              <input
                id="senha"
                type={mostrarSenha ? "text" : "password"}
                aria-invalid={!!erro}
                aria-describedby={erro ? "login-erro" : undefined}
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <button type="button" className="fantasma" onClick={() => setMostrarSenha((v) => !v)} aria-pressed={mostrarSenha}>
                {mostrarSenha ? t.ocultar : t.mostrar}
              </button>
            </div>
          </div>
          <button type="submit" className="grande bloco" disabled={!login.trim() || !senha || entrando}>
            {entrando ? t.entrando : t.entrar}
          </button>
          <Link to="/esqueci-senha" className="centro">
            {t.esqueciSenha}
          </Link>
        </form>
        <Ajuda titulo={t.ajudaTitulo}>
          <p>{t.ajudaTexto}</p>
        </Ajuda>
        <PreferenciasAcessibilidade />
      </main>
    </div>
  );
}
