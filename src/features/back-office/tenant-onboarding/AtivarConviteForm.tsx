import { useState } from "react";
import { useParams } from "react-router-dom";
import { ApiError } from "../../../shared/api/ApiError";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { obterTextos, useTextos } from "../../../shared/i18n/idioma";
import { SeletorIdioma } from "../../../shared/ui/SeletorIdioma";
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
  const textos = useTextos();
  const t = textos.backOffice.convite;
  const {
    dados: convite,
    erro,
    carregando,
  } = useRecurso(() => consultarConvite(token ?? ""), obterTextos().backOffice.convite.falhaCarregar);
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
      setErroAcao(excecao instanceof ApiError ? excecao.message : mensagemDeErro(excecao, t.falhaAtivar));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="tela-entrada">
      <main>
        <div className="entrada-idioma">
          <SeletorIdioma />
        </div>
        <div className="marca">
          <img src="/icone-app.svg" alt="" /> Milebag
        </div>
        <h1>{t.titulo}</h1>

        {carregando && <Carregando texto={t.verificando} />}
        {erro && (
          <Alerta tipo="erro">
            {erro} {t.pecaNovo}
          </Alerta>
        )}

        {convite && convite.status !== "PENDENTE" && (
          <Alerta tipo="erro">
            {convite.status === "EXPIRADO" ? t.expirou : t.jaUsado} {t.pecaNovo}
          </Alerta>
        )}

        {ativado && <Alerta tipo="sucesso">{t.senhaDefinida(convite?.emailDestinatario ?? "")}</Alerta>}

        {convite && convite.status === "PENDENTE" && !ativado && (
          <form onSubmit={ativar} className="cartao formulario">
            <p className="m-0">
              {t.convidado} <strong>{convite.tenantNome}</strong> {t.comEmail} <strong>{convite.emailDestinatario}</strong>.
            </p>
            {erroAcao && <Alerta tipo="erro">{erroAcao}</Alerta>}
            <div>
              <label htmlFor="senha">{textos.senha.minimo(t.campoSenha, TAMANHO_MINIMO_SENHA)}</label>
              <input id="senha" type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
            </div>
            <div>
              <label htmlFor="confirmacaoSenha">{t.repita}</label>
              <input
                id="confirmacaoSenha"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!confirmacao && senha !== confirmacao}
                aria-describedby={!!confirmacao && senha !== confirmacao ? "confirmacaoSenha-erro" : undefined}
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
              />
              {confirmacao && senha !== confirmacao && (
                <span id="confirmacaoSenha-erro" role="alert" className="texto-erro">
                  {textos.senha.naoConferem}
                </span>
              )}
            </div>
            <button type="submit" className="grande bloco" disabled={invalido || enviando}>
              {enviando ? t.ativando : t.ativar}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
