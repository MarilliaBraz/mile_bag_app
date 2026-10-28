import { Icone } from "../../../../../shared/components/Icone";
import { useCallback, useState } from "react";
import { ApiError } from "../../../../../shared/services/ApiError";
import { useIntervaloEmPrimeiroPlano } from "../../../../../shared/hooks/useIntervaloEmPrimeiroPlano";
import { formatarHora } from "../../../../../shared/utils/formatar";
import { useTextos } from "../../../../../shared/utils/i18n/idioma";
import { Alerta, Carregando } from "../../../../../shared/components/Alerta";
import { consultarConversa, enviarMensagem } from "../services/mensagemService";
import type { CanalMensagem, Conversa as ConversaDados, Mensagem } from "../types";
import { AvisoSemContato } from "./AvisoSemContato";
import { CampoMensagem } from "./CampoMensagem";

const INTERVALO_ATUALIZACAO_MS = 10_000;
// Envios do mesmo texto por canais diferentes saem quase juntos.
const JANELA_AGRUPAMENTO_MS = 60_000;

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
        // Mesmo canal de novo é um reenvio ("Enviar de novo"), não o mesmo envio por outro canal.
        !balao.canais.some(({ canal }) => canal === mensagem.canal) &&
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
 * Mensagem do motorista que não chegou por nenhum canal: reenvia o mesmo
 * texto (o servidor escolhe de novo os canais, FR-003). Só aparece quando
 * todos falharam, para não duplicar o que já chegou por outro canal.
 */
function ReenviarMensagem({ entregaId, conteudo, aoEnviar }: { entregaId: string; conteudo: string; aoEnviar: () => void }) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const t = useTextos().motorista.mensagens;

  async function reenviar() {
    setErro(null);
    setEnviando(true);
    try {
      await enviarMensagem(entregaId, conteudo);
      aoEnviar();
    } catch (excecao) {
      setErro(excecao instanceof ApiError ? excecao.message : t.semConexaoReenviar);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mt-2">
      <button type="button" className="secundario" onClick={reenviar} disabled={enviando}>
        <Icone nome="sincronizar" /> {enviando ? t.enviando : t.enviarDeNovo}
      </button>
      {erro && (
        <p role="alert" className="selo-falha mt-2 mb-0">
          {erro}
        </p>
      )}
    </div>
  );
}

/**
 * Conversa da entrega com o passageiro (HU18): mensagens manuais e avisos
 * automáticos numa linha do tempo só (FR-001). Atualiza sozinha enquanto
 * aberta, já que as respostas do passageiro chegam por Telegram/e-mail sem
 * ação do motorista (FR-004). Só atualiza com o app visível (RNF11).
 */
export function Conversa({ entregaId }: { entregaId: string }) {
  const [conversa, setConversa] = useState<ConversaDados | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const t = useTextos().motorista.mensagens;

  const carregar = useCallback(async () => {
    try {
      setConversa(await consultarConversa(entregaId));
      setErro(null);
    } catch (excecao) {
      setErro(excecao instanceof ApiError ? excecao.message : t.falhaCarregar);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entregaId]);

  useIntervaloEmPrimeiroPlano(carregar, INTERVALO_ATUALIZACAO_MS);

  if (erro && !conversa) {
    return <Alerta tipo="erro">{erro}</Alerta>;
  }
  if (!conversa) {
    return <Carregando texto={t.carregando} />;
  }
  if (!conversa.contatoDisponivel.email) {
    return <AvisoSemContato />;
  }

  const baloes = agrupar(conversa.mensagens);

  return (
    <div className="cartao">
      {!conversa.contatoDisponivel.telegram && <p className="texto-apoio">{t.viaEmail}</p>}

      {baloes.length === 0 ? (
        <p className="texto-apoio">{t.nenhuma}</p>
      ) : (
        <ul className="conversa">
          {baloes.map(({ chave, mensagem, canais }) => (
            <li key={chave} className={`balao balao-${mensagem.autor.toLowerCase()}`}>
              <div className="texto-apoio fs-xs">
                {t.autores[mensagem.autor]} · {formatarHora(mensagem.criadoEm)}
              </div>
              <div>{mensagem.conteudo}</div>
              <div className="texto-apoio" style={{ fontSize: "0.8125rem", marginTop: "0.25rem" }}>
                {canais.map(({ canal, falhou }) =>
                  falhou ? (
                    // Selo com fundo próprio: legível sobre qualquer balão (o do motorista é azul).
                    <span key={canal} className="selo-falha" style={{ marginRight: "0.5rem" }}>
                      <Icone nome="alerta" /> {t.naoEnviado(t.canais[canal])}
                    </span>
                  ) : (
                    <span key={canal} style={{ marginRight: "0.5rem" }}>
                      <Icone nome={canal === "EMAIL" ? "email" : "enviar"} /> {t.canais[canal]}
                    </span>
                  ),
                )}
              </div>
              {mensagem.autor === "MOTORISTA" && canais.every(({ falhou }) => falhou) && (
                <ReenviarMensagem entregaId={entregaId} conteudo={mensagem.conteudo} aoEnviar={carregar} />
              )}
            </li>
          ))}
        </ul>
      )}

      <CampoMensagem entregaId={entregaId} aoEnviar={carregar} />
    </div>
  );
}
