import { useState } from "react";
import { Link } from "react-router-dom";
import { requisitar } from "../api/httpClient";
import { mensagemDeErro } from "../format/formatar";

/**
 * Pedido de redefinição de senha (HU25). A resposta é sempre a mesma, exista ou não a conta - a tela não revela quais
 * logins existem. Só contas cujo login é um e-mail recebem o link; para as outras (ex.: motorista com login simples)
 * o aviso manda pedir ao administrador.
 */
export function EsqueciSenha() {
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
      setErro(mensagemDeErro(excecao, "Não foi possível enviar o pedido. Tente de novo."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "3rem auto", padding: "0 1rem" }}>
      <h1>Esqueci minha senha</h1>
      {enviado ? (
        <p role="status">
          Se existir uma conta com esse e-mail, enviamos um link para escolher uma senha nova. Ele vale por 1 hora e só pode ser usado uma vez.
          Se o seu login não é um e-mail, peça ao administrador da sua empresa para redefinir a senha.
        </p>
      ) : (
        <form onSubmit={enviar} style={{ display: "grid", gap: "0.75rem" }}>
          {erro && (
            <p role="alert" style={{ color: "var(--erro)", margin: 0 }}>
              {erro}
            </p>
          )}
          <div>
            <label htmlFor="login">E-mail de login</label>
            <input id="login" type="email" autoComplete="username" value={login} onChange={(e) => setLogin(e.target.value)} autoFocus />
          </div>
          <div>
            <button type="submit" disabled={!login.includes("@") || enviando}>
              {enviando ? "Enviando…" : "Enviar link"}
            </button>
          </div>
        </form>
      )}
      <p>
        <Link to="/login">← Voltar ao login</Link>
      </p>
    </main>
  );
}
