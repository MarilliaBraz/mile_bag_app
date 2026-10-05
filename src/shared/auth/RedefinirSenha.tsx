import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { requisitar } from "../api/httpClient";
import { mensagemDeErro } from "../format/formatar";
import { Alerta } from "../ui/Alerta";

const TAMANHO_MINIMO_SENHA = 8;

/** Destino do link do e-mail de recuperação (HU25): escolhe a senha nova. O token é de uso único e vale por 1 hora. */
export function RedefinirSenha() {
  const { token } = useParams<{ token: string }>();
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [concluido, setConcluido] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const invalido = senha.length < TAMANHO_MINIMO_SENHA || senha !== confirmacao;

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await requisitar<void>("/api/v1/auth/redefinir-senha", { metodo: "POST", corpo: { token, senha } });
      setConcluido(true);
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, "Não foi possível redefinir a senha."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="tela-entrada">
      <main>
      <h1>Nova senha</h1>
      {concluido ? (
        <Alerta tipo="sucesso">
          Senha alterada. <Link to="/login">Entrar com a senha nova</Link>
        </Alerta>
      ) : (
        <form onSubmit={enviar} className="cartao formulario">
          {erro && (
            <Alerta tipo="erro">
              {erro} <Link to="/esqueci-senha">Pedir um novo link</Link>
          </Alerta>
          )}
          <div>
            <label htmlFor="senha">Senha nova (mínimo {TAMANHO_MINIMO_SENHA} caracteres)</label>
            <input id="senha" type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          <div>
            <label htmlFor="confirmacao">Repita a senha</label>
            <input id="confirmacao" type="password" autoComplete="new-password" aria-invalid={!!confirmacao && senha !== confirmacao} aria-describedby={!!confirmacao && senha !== confirmacao ? "confirmacao-erro" : undefined} value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} />
            {confirmacao && senha !== confirmacao && <span id="confirmacao-erro" role="alert" className="texto-erro">As senhas não conferem.</span>}
          </div>
          <div>
            <button type="submit" className="grande bloco" disabled={invalido || enviando}>
              {enviando ? "Salvando…" : "Salvar senha"}
            </button>
          </div>
        </form>
      )}
      </main>
    </div>
  );
}
