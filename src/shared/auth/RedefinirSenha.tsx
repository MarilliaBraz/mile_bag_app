import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { requisitar } from "../api/httpClient";
import { mensagemDeErro } from "../format/formatar";
import { useTextos } from "../i18n/idioma";
import { Alerta } from "../ui/Alerta";

const TAMANHO_MINIMO_SENHA = 8;

/** Destino do link do e-mail de recuperação (HU25): escolhe a senha nova. O token é de uso único e vale por 1 hora. */
export function RedefinirSenha() {
  const { token } = useParams<{ token: string }>();
  const t = useTextos();
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
      setErro(mensagemDeErro(excecao, t.senha.redefinir.falha));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="tela-entrada">
      <main>
        <h1>{t.senha.redefinir.titulo}</h1>
        {concluido ? (
          <Alerta tipo="sucesso">
            {t.senha.redefinir.alterada} <Link to="/login">{t.senha.redefinir.entrarComNova}</Link>
          </Alerta>
        ) : (
          <form onSubmit={enviar} className="cartao formulario">
            {erro && (
              <Alerta tipo="erro">
                {erro} <Link to="/esqueci-senha">{t.senha.redefinir.pedirNovoLink}</Link>
              </Alerta>
            )}
            <div>
              <label htmlFor="senha">{t.senha.minimo(t.senha.redefinir.senhaNova, TAMANHO_MINIMO_SENHA)}</label>
              <input id="senha" type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
            </div>
            <div>
              <label htmlFor="confirmacao">{t.senha.redefinir.repita}</label>
              <input
                id="confirmacao"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!confirmacao && senha !== confirmacao}
                aria-describedby={!!confirmacao && senha !== confirmacao ? "confirmacao-erro" : undefined}
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
              />
              {confirmacao && senha !== confirmacao && (
                <span id="confirmacao-erro" role="alert" className="texto-erro">
                  {t.senha.naoConferem}
                </span>
              )}
            </div>
            <div>
              <button type="submit" className="grande bloco" disabled={invalido || enviando}>
                {enviando ? t.comum.salvando : t.senha.redefinir.salvar}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
