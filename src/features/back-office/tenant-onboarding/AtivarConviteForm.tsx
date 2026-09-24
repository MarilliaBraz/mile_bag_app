import { useState } from "react";
import { useParams } from "react-router-dom";
import { ApiError } from "../../../shared/api/ApiError";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { ativarConvite, consultarConvite } from "./tenantsApi";

const TAMANHO_MINIMO_SENHA = 8;

/**
 * Ativação do convite do primeiro administrador (HU15). Rota pública: o
 * token vem no link do e-mail e é validado antes de mostrar o formulário, para
 * o administrador não digitar uma senha que seria recusada. A API ainda não
 * tem login, então depois de ativar não há para onde entrar - a tela diz isso.
 */
export function AtivarConviteForm() {
  const { token } = useParams<{ token: string }>();
  const { dados: convite, erro, carregando } = useRecurso(() => consultarConvite(token ?? ""), "Este convite não é válido.");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [ativado, setAtivado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const invalido = senha.length < TAMANHO_MINIMO_SENHA || senha !== confirmacao;

  async function ativar(evento: React.FormEvent) {
    evento.preventDefault();
    setErroAcao(null);
    setEnviando(true);
    try {
      await ativarConvite(token ?? "", senha);
      setAtivado(true);
    } catch (excecao) {
      setErroAcao(excecao instanceof ApiError ? excecao.message : mensagemDeErro(excecao, "Não foi possível ativar o convite."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "3rem auto", padding: "0 1rem" }}>
      <h1>Ativar acesso</h1>

      {carregando && <p role="status">Verificando o convite…</p>}
      {erro && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {erro} Peça um novo convite a quem cadastrou a empresa.
        </p>
      )}

      {convite && convite.status !== "PENDENTE" && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {convite.status === "EXPIRADO" ? "Este convite expirou." : "Este convite já foi usado ou substituído por outro."} Peça um novo convite a quem
          cadastrou a empresa.
        </p>
      )}

      {ativado && (
        <p role="status" style={{ color: "var(--confirmacao)" }}>
          Senha definida para {convite?.emailDestinatario}. O acesso por login ainda está em construção: a conta já existe, mas não há tela de entrada com
          e-mail e senha nesta versão.
        </p>
      )}

      {convite && convite.status === "PENDENTE" && !ativado && (
        <form onSubmit={ativar} style={{ display: "grid", gap: "0.75rem" }}>
          <p style={{ margin: 0 }}>
            Você foi convidado a administrar <strong>{convite.tenantNome}</strong> com o e-mail <strong>{convite.emailDestinatario}</strong>.
          </p>
          {erroAcao && (
            <p role="alert" style={{ color: "var(--erro)", margin: 0 }}>
              {erroAcao}
            </p>
          )}
          <div>
            <label htmlFor="senha">Senha (mínimo {TAMANHO_MINIMO_SENHA} caracteres)</label>
            <input id="senha" type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          <div>
            <label htmlFor="confirmacaoSenha">Repita a senha</label>
            <input id="confirmacaoSenha" type="password" autoComplete="new-password" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} />
            {confirmacao && senha !== confirmacao && <span style={{ color: "var(--erro)", fontSize: "0.85rem" }}>As senhas não conferem.</span>}
          </div>
          <div>
            <button type="submit" disabled={invalido || enviando}>
              {enviando ? "Ativando…" : "Ativar acesso"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
