import { useState } from "react";
import { Link } from "react-router-dom";
import { trocarSenha } from "../services/authService";
import { mensagemDeErro } from "../../../shared/utils/formatar";
import { useTextos } from "../../../shared/utils/i18n/idioma";
import { Alerta } from "../../../shared/components/Alerta";
import { definirToken, obterPapel, rotaInicialDo } from "../../../shared/services/authStorage";

const TAMANHO_MINIMO_SENHA = 8;

/**
 * "Minha senha" (HU25): o usuário logado troca a própria senha informando a atual. A API devolve um token novo (as
 * outras sessões da conta caem) e a tela o guarda para quem trocou continuar logado.
 */
export function TrocarSenha() {
  const t = useTextos();
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [trocada, setTrocada] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const invalido = !atual || nova.length < TAMANHO_MINIMO_SENHA || nova !== confirmacao;

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const resposta = await trocarSenha(atual, nova);
      definirToken(resposta.token);
      setAtual("");
      setNova("");
      setConfirmacao("");
      setTrocada(true);
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.senha.trocar.falha));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="tela-entrada">
      <main>
        <Link to={rotaInicialDo(obterPapel())}>← {t.comum.voltar}</Link>
        <h1>{t.senha.trocar.titulo}</h1>
        {trocada && <Alerta tipo="sucesso">{t.senha.trocar.alterada}</Alerta>}
        <form onSubmit={enviar} className="cartao formulario">
          {erro && <Alerta tipo="erro">{erro}</Alerta>}
          <div>
            <label htmlFor="atual">{t.senha.trocar.atual}</label>
            <input id="atual" type="password" autoComplete="current-password" value={atual} onChange={(e) => setAtual(e.target.value)} />
          </div>
          <div>
            <label htmlFor="nova">{t.senha.minimo(t.senha.trocar.senhaNova, TAMANHO_MINIMO_SENHA)}</label>
            <input id="nova" type="password" autoComplete="new-password" value={nova} onChange={(e) => setNova(e.target.value)} />
          </div>
          <div>
            <label htmlFor="confirmacao">{t.senha.trocar.repita}</label>
            <input
              id="confirmacao"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!confirmacao && nova !== confirmacao}
              aria-describedby={!!confirmacao && nova !== confirmacao ? "confirmacao-erro" : undefined}
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
            />
            {confirmacao && nova !== confirmacao && (
              <span id="confirmacao-erro" role="alert" className="texto-erro">
                {t.senha.naoConferem}
              </span>
            )}
          </div>
          <div>
            <button type="submit" className="grande bloco" disabled={invalido || enviando}>
              {enviando ? t.comum.salvando : t.senha.trocar.trocar}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
