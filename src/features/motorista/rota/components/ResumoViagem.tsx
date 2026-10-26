import type { TrajetoDetalhado } from "../types";
import { formatarDuracao } from "./MapaRotas";

const ROTULO_CHECKPOINT: Record<string, string> = {
  PARTIDA: "Partida",
  A_CAMINHO: "A caminho",
  CHEGADA: "Chegada",
  COMPROVANTE: "Comprovante",
  OCORRENCIA: "Ocorrência",
};

function horaDe(dataHora: string): string {
  return new Date(dataHora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatarKm(valor: string): string {
  return `${Number(valor).toFixed(1).replace(".", ",")} km`;
}

/**
 * Estado atual do trajeto e histórico de cálculos de rota (HU04) - os
 * valores finais (km, tempo, pedágios) só existem depois do encerramento,
 * então ficam ocultos enquanto o trajeto está em execução.
 */
export function ResumoViagem({ trajeto }: { trajeto: TrajetoDetalhado }) {
  const encerrado = trajeto.status === "ENCERRADO";

  return (
    <section>
      <h2>Viagem {encerrado ? "encerrada" : "em andamento"}</h2>
      <div className="cartao">
        {encerrado && trajeto.kmIdaFinal && trajeto.kmVoltaFinal && (
          <div className="dados-grade mb-4">
            <div>
              <div className="texto-apoio">Ida</div>
              <div className="destaque">{formatarKm(trajeto.kmIdaFinal)}</div>
            </div>
            <div>
              <div className="texto-apoio">Volta</div>
              <div className="destaque">{formatarKm(trajeto.kmVoltaFinal)}</div>
            </div>
            {trajeto.tempoFinal !== null && (
              <div>
                <div className="texto-apoio">Tempo</div>
                <div className="destaque">{formatarDuracao(trajeto.tempoFinal)}</div>
              </div>
            )}
          </div>
        )}
        {encerrado && trajeto.justificativaDivergencia && (
          <p className="texto-apoio">Justificativa de divergência: {trajeto.justificativaDivergencia}</p>
        )}

        <h3>Linha do tempo · início às {horaDe(trajeto.dataInicio)}</h3>
        <ol className="linha-tempo">
          {trajeto.checkpoints.map((checkpoint) => (
            <li key={checkpoint.id}>
              <strong>{ROTULO_CHECKPOINT[checkpoint.tipo] ?? checkpoint.tipo}</strong>{" "}
              <span className="texto-apoio">
                {horaDe(checkpoint.dataHora)}
                {checkpoint.ausente ? " · sem GPS" : ""}
              </span>
            </li>
          ))}
        </ol>

        <details className="ajuda sem-icone">
          <summary>Cálculos de rota ({trajeto.calculosRota.length})</summary>
          <ul className="linha-tempo">
            {trajeto.calculosRota.map((calculo) => (
              <li key={calculo.id}>
                <strong>{calculo.ehRotaInicial ? "Rota inicial" : "Recálculo"}</strong>
                {calculo.origemSelecao === "PROPRIA" ? " (própria)" : ""} <span className="texto-apoio">{horaDe(calculo.dataHora)}</span>
                <div className="texto-apoio">
                  {formatarKm(calculo.kmIda)} ida · {formatarKm(calculo.kmVolta)} volta
                  {calculo.origemSelecao === "PROPRIA" ? "" : ` · ${formatarDuracao(calculo.tempoEstimado)}`}
                </div>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}
