import { useState } from "react";
import {
  atenderAlerta,
  linkMapa,
  listarAlertas,
  type AlertaEmergencia,
  type StatusAlertaEmergencia,
} from "../../../shared/api/emergenciaApi";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { Alerta, Carregando, Vazio } from "../../../shared/ui/Alerta";
import { Icone } from "../../../shared/ui/Icone";
import { Pagina, Painel } from "../layout/Pagina";

const SITUACAO: Record<StatusAlertaEmergencia, { texto: string; tom: "erro" | "sucesso" | "info" }> = {
  ABERTO: { texto: "Em aberto", tom: "erro" },
  ATENDIDO: { texto: "Atendido", tom: "sucesso" },
  CANCELADO: { texto: "Cancelado pelo motorista", tom: "info" },
};

const quando = (iso: string) => new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

/**
 * Alertas de emergência dos motoristas (HU30): os em aberto primeiro, para
 * atender; depois o histórico, que nunca é apagado (RD16).
 */
export function TelaEmergencias() {
  const { dados, erro, recarregar } = useRecurso(() => listarAlertas(), "Não foi possível carregar os alertas.");
  const abertos = dados?.filter((alerta) => alerta.status === "ABERTO") ?? [];
  const encerrados = dados?.filter((alerta) => alerta.status !== "ABERTO") ?? [];

  return (
    <Pagina
      titulo="Emergências"
      descricao="Alertas acionados pelos motoristas. Entre em contato com o motorista e marque o alerta como atendido."
    >
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {!dados && !erro && <Carregando texto="Carregando alertas…" />}

      {dados && (
        <>
          <Painel titulo={`Em aberto (${abertos.length})`}>
            {abertos.length === 0 ? (
              <Vazio icone="checkCirculo" titulo="Nenhum alerta em aberto" />
            ) : (
              <ul className="lista">
                {abertos.map((alerta) => (
                  <AlertaAberto key={alerta.id} alerta={alerta} aoAtender={recarregar} />
                ))}
              </ul>
            )}
          </Painel>

          {encerrados.length > 0 && (
            <Painel titulo="Histórico">
              <ul className="lista-simples">
                {encerrados.map((alerta) => (
                  <li key={alerta.id}>
                    <span>
                      <strong>{alerta.motoristaNome}</strong> — {quando(alerta.dataHora)}
                      {alerta.observacao && <span className="texto-apoio"> · {alerta.observacao}</span>}
                    </span>
                    <span className={`selo selo-${SITUACAO[alerta.status].tom}`}>{SITUACAO[alerta.status].texto}</span>
                  </li>
                ))}
              </ul>
            </Painel>
          )}
        </>
      )}
    </Pagina>
  );
}

function AlertaAberto({ alerta, aoAtender }: { alerta: AlertaEmergencia; aoAtender: () => Promise<unknown> }) {
  const [observacao, setObservacao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const mapa = linkMapa(alerta);

  async function atender() {
    setErro(null);
    setEnviando(true);
    try {
      await atenderAlerta(alerta.id, observacao.trim());
      await aoAtender();
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, "Não foi possível marcar o alerta como atendido."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <li className="cartao">
      <div className="cartao-cabecalho">
        <strong>{alerta.motoristaNome}</strong>
        <span className="selo selo-erro">
          <Icone nome="alerta" /> {quando(alerta.dataHora)}
        </span>
      </div>
      <div className="linha-icone texto-apoio">
        <Icone nome="pino" />
        {mapa ? (
          <a href={mapa} target="_blank" rel="noreferrer">
            Ver a posição no mapa
          </a>
        ) : (
          <span>O aparelho não informou a posição.</span>
        )}
      </div>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      <div className="form-linha mt-3">
        <div>
          <label htmlFor={`observacao-${alerta.id}`}>Observação (opcional)</label>
          <input
            id={`observacao-${alerta.id}`}
            value={observacao}
            onChange={(evento) => setObservacao(evento.target.value)}
            placeholder="Ex.: falei com o motorista, estava tudo bem"
          />
        </div>
        <button type="button" onClick={atender} disabled={enviando}>
          <Icone nome="checkCirculo" /> {enviando ? "Salvando…" : "Marcar como atendido"}
        </button>
      </div>
    </li>
  );
}
