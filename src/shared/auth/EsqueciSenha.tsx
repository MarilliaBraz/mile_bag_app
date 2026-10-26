import { useState } from "react";
import { Link } from "react-router-dom";
import { requisitar } from "../api/httpClient";
import { mensagemDeErro } from "../format/formatar";
import { useTextos } from "../i18n/idioma";
import { Alerta } from "../ui/Alerta";

/**
 * Pedido de redefinição de senha (HU25). A resposta é sempre a mesma, exista ou não a conta - a tela não revela quais
 * logins existem. Só contas cujo login é um e-mail recebem o link; para as outras (ex.: motorista com login simples)
 * o aviso manda pedir ao administrador.
 */
export function EsqueciSenha() {
  const t = useTextos();
  const [login, setLogin] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await requisitar<void>("/api/v1/auth/esqueci-senha", { metodo: "POST", corpo: { login: login.trim() } });
      setEnviado(true);
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.senha.esqueci.falha));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="tela-entrada">
      <main>
        <h1>{t.senha.esqueci.titulo}</h1>
        {enviado ? (
          <p role="status">{t.senha.esqueci.enviado}</p>
        ) : (
          <form onSubmit={enviar} className="cartao formulario">
            {erro && <Alerta tipo="erro">{erro}</Alerta>}
            <div>
              <label htmlFor="login">{t.senha.esqueci.emailLogin}</label>
              <input id="login" type="email" autoComplete="username" value={login} onChange={(e) => setLogin(e.target.value)} autoFocus />
            </div>
            <div>
              <button type="submit" className="grande bloco" disabled={!login.includes("@") || enviando}>
                {enviando ? t.comum.enviando : t.senha.esqueci.enviarLink}
              </button>
            </div>
          </form>
        )}
        <p>
          <Link to="/login">{t.senha.esqueci.voltarLogin}</Link>
        </p>
      </main>
    </div>
  );
}
