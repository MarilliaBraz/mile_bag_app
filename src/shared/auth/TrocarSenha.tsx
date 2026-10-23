import { useState } from "react";
import { Link } from "react-router-dom";
import { requisitar } from "../api/httpClient";
import { mensagemDeErro } from "../format/formatar";
import { Alerta } from "../ui/Alerta";
import { definirToken, obterPapel, rotaInicialDo } from "./authStorage";

const TAMANHO_MINIMO_SENHA = 8;

/**
 * "Minha senha" (HU25): o usuário logado troca a própria senha informando a atual. A API devolve um token novo (as
 * outras sessões da conta caem) e a tela o guarda para quem trocou continuar logado.
 */
export function TrocarSenha() {
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
      const resposta = await requisitar<{ token: string }>("/api/v1/auth/senha", {
        metodo: "POST",
        corpo: { senhaAtual: atual, novaSenha: nova },
      });
      definirToken(resposta.token);
      setAtual("");
      setNova("");
      setConfirmacao("");
      setTrocada(true);
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, "Não foi possível trocar a senha."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="tela-entrada">
      <main>
        <Link to={rotaInicialDo(obterPapel())}>← Voltar</Link>
        <h1>Minha senha</h1>
        {trocada && <Alerta tipo="sucesso">Senha alterada. As outras sessões desta conta foram encerradas.</Alerta>}
        <form onSubmit={enviar} className="cartao formulario">
          {erro && <Alerta tipo="erro">{erro}</Alerta>}
          <div>
            <label htmlFor="atual">Senha atual</label>
            <input id="atual" type="password" autoComplete="current-password" value={atual} onChange={(e) => setAtual(e.target.value)} />
          </div>
          <div>
            <label htmlFor="nova">Senha nova (mínimo {TAMANHO_MINIMO_SENHA} caracteres)</label>
            <input id="nova" type="password" autoComplete="new-password" value={nova} onChange={(e) => setNova(e.target.value)} />
          </div>
          <div>
            <label htmlFor="confirmacao">Repita a senha nova</label>
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
                As senhas não conferem.
              </span>
            )}
          </div>
          <div>
            <button type="submit" className="grande bloco" disabled={invalido || enviando}>
              {enviando ? "Salvando…" : "Trocar senha"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
