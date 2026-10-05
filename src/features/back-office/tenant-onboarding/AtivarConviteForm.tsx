import { useState } from "react";
import { useParams } from "react-router-dom";
import { ApiError } from "../../../shared/api/ApiError";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { ativarConvite, consultarConvite } from "./tenantsApi";
import { Alerta, Carregando } from "../../../shared/ui/Alerta";

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
    <div className="tela-entrada">
      <main>
      <div className="marca">
        <img src="/icone-app.svg" alt="" /> Milebag
      </div>
      <h1>Ativar acesso</h1>

      {carregando && <Carregando texto="Verificando o convite…" />}
      {erro && (
        <Alerta tipo="erro">
          {erro} Peça um novo convite a quem cadastrou a empresa.
        </Alerta>
      )}

      {convite && convite.status !== "PENDENTE" && (
        <Alerta tipo="erro">
          {convite.status === "EXPIRADO" ? "Este convite expirou." : "Este convite já foi usado ou substituído por outro."} Peça um novo convite a quem
          cadastrou a empresa.
        </Alerta>
      )}

      {ativado && (
        <Alerta tipo="sucesso">
          Senha definida para {convite?.emailDestinatario}. O acesso por login ainda está em construção: a conta já existe, mas não há tela de entrada com
          e-mail e senha nesta versão.
        </Alerta>
      )}

      {convite && convite.status === "PENDENTE" && !ativado && (
        <form onSubmit={ativar} className="cartao formulario">
          <p style={{ margin: 0 }}>
            Você foi convidado a administrar <strong>{convite.tenantNome}</strong> com o e-mail <strong>{convite.emailDestinatario}</strong>.
          </p>
          {erroAcao && (
            <Alerta tipo="erro">
              {erroAcao}
            </Alerta>
          )}
          <div>
            <label htmlFor="senha">Senha (mínimo {TAMANHO_MINIMO_SENHA} caracteres)</label>
            <input id="senha" type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          <div>
            <label htmlFor="confirmacaoSenha">Repita a senha</label>
            <input id="confirmacaoSenha" type="password" autoComplete="new-password" aria-invalid={!!confirmacao && senha !== confirmacao} aria-describedby={!!confirmacao && senha !== confirmacao ? "confirmacaoSenha-erro" : undefined} value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} />
            {confirmacao && senha !== confirmacao && <span id="confirmacaoSenha-erro" role="alert" className="texto-erro">As senhas não conferem.</span>}
          </div>
          <button type="submit" className="grande bloco" disabled={invalido || enviando}>
            {enviando ? "Ativando…" : "Ativar acesso"}
          </button>
        </form>
      )}
      </main>
    </div>
  );
}
