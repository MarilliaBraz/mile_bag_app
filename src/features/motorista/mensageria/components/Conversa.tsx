import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../../../../shared/api/ApiError";
import { consultarConversa, type CanalMensagem, type Conversa as ConversaDados, type Mensagem } from "../services/mensagemService";
import { AvisoSemContato } from "./AvisoSemContato";
import { CampoMensagem } from "./CampoMensagem";

const INTERVALO_ATUALIZACAO_MS = 10_000;
// Envios do mesmo texto por canais diferentes saem quase juntos.
const JANELA_AGRUPAMENTO_MS = 60_000;

const ROTULO_CANAL: Record<CanalMensagem, string> = { TELEGRAM: "Telegram", EMAIL: "E-mail" };
const ROTULO_AUTOR = { MOTORISTA: "Você", PASSAGEIRO: "Passageiro", SISTEMA: "Aviso automático" } as const;

type Balao = { chave: string; mensagem: Mensagem; canais: { canal: CanalMensagem; falhou: boolean }[] };

/**
 * O servidor grava uma Mensagem por canal (o e-mail e o Telegram falham de
 * forma independente, FR-009), mas o motorista vê uma conversa só (FR-001):
 * o mesmo texto do mesmo autor enviado por dois canais quase ao mesmo tempo
 * vira um único balão com a lista de canais.
 */
function agrupar(mensagens: Mensagem[]): Balao[] {
  const baloes: Balao[] = [];
  for (const mensagem of mensagens) {
    const existente = baloes.find(
      (balao) =>
        balao.mensagem.autor === mensagem.autor &&
        balao.mensagem.conteudo === mensagem.conteudo &&
        balao.mensagem.tipoEvento === mensagem.tipoEvento &&
        mensagem.autor !== "PASSAGEIRO" &&
        Math.abs(new Date(mensagem.criadoEm).getTime() - new Date(balao.mensagem.criadoEm).getTime()) < JANELA_AGRUPAMENTO_MS,
    );
    const canal = { canal: mensagem.canal, falhou: mensagem.statusEnvio === "FALHOU" };
    if (existente) {
      existente.canais.push(canal);
    } else {
      baloes.push({ chave: mensagem.id, mensagem, canais: [canal] });
    }
  }
  return baloes;
}

/**
 * Conversa da entrega com o passageiro (HU18): mensagens manuais e avisos
 * automáticos numa linha do tempo só (FR-001). Atualiza sozinha enquanto
 * aberta, já que as respostas do passageiro chegam por Telegram/e-mail sem
 * ação do motorista (FR-004).
 */
export function Conversa({ entregaId }: { entregaId: string }) {
  const [conversa, setConversa] = useState<ConversaDados | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setConversa(await consultarConversa(entregaId));
      setErro(null);
    } catch (excecao) {
      setErro(excecao instanceof ApiError ? excecao.message : "Não foi possível carregar a conversa.");
    }
  }, [entregaId]);

  useEffect(() => {
    carregar();
    const intervalo = setInterval(carregar, INTERVALO_ATUALIZACAO_MS);
    return () => clearInterval(intervalo);
  }, [carregar]);

  if (erro && !conversa) {
    return (
      <p role="alert" style={{ color: "var(--erro)" }}>
        {erro}
      </p>
    );
  }
  if (!conversa) {
    return <p role="status">Carregando conversa…</p>;
  }
  if (!conversa.contatoDisponivel.email) {
    return <AvisoSemContato />;
  }

  const baloes = agrupar(conversa.mensagens);

  return (
    <div>
      {!conversa.contatoDisponivel.telegram && (
        <p style={{ fontSize: "0.85rem" }}>
          As mensagens vão por e-mail, com um link para o passageiro continuar a conversa pelo Telegram.
        </p>
      )}

      {baloes.length === 0 ? (
        <p style={{ fontSize: "0.9rem" }}>Nenhuma mensagem ainda. Os avisos de andamento da entrega saem automaticamente.</p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {baloes.map(({ chave, mensagem, canais }) => {
            const doMotorista = mensagem.autor === "MOTORISTA";
            return (
              <li key={chave} style={{ display: "flex", justifyContent: doMotorista ? "flex-end" : "flex-start", marginBottom: "0.5rem" }}>
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "0.5rem 0.75rem",
                    borderRadius: 8,
                    border: "1px solid var(--borda)",
                    borderStyle: mensagem.autor === "SISTEMA" ? "dashed" : "solid",
                  }}
                >
                  <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                    {ROTULO_AUTOR[mensagem.autor]} ·{" "}
                    {new Date(mensagem.criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div>{mensagem.conteudo}</div>
                  <div style={{ fontSize: "0.7rem", marginTop: "0.25rem" }}>
                    {canais.map(({ canal, falhou }) => (
                      <span key={canal} style={{ marginRight: "0.5rem", color: falhou ? "var(--erro)" : "inherit" }}>
                        {ROTULO_CANAL[canal]}
                        {falhou ? " (falhou)" : ""}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <CampoMensagem entregaId={entregaId} aoEnviar={carregar} />
    </div>
  );
}
