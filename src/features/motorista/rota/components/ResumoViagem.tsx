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
    <section style={{ marginTop: "1.5rem" }}>
      <h2>Viagem {encerrado ? "encerrada" : "em andamento"}</h2>
      <p style={{ fontSize: "0.9rem" }}>Início: {horaDe(trajeto.dataInicio)}</p>

      <h3>Cálculos de rota ({trajeto.calculosRota.length})</h3>
      <ul>
        {trajeto.calculosRota.map((calculo) => (
          <li key={calculo.id}>
            {horaDe(calculo.dataHora)} — {formatarKm(calculo.kmIda)} ida / {formatarKm(calculo.kmVolta)} volta ·{" "}
            {formatarDuracao(calculo.tempoEstimado)}
            {calculo.ehRotaInicial ? " · rota inicial" : " · recálculo"}
          </li>
        ))}
      </ul>

      <h3>Checkpoints ({trajeto.checkpoints.length})</h3>
      <ul>
        {trajeto.checkpoints.map((checkpoint) => (
          <li key={checkpoint.id}>
            {horaDe(checkpoint.dataHora)} — {ROTULO_CHECKPOINT[checkpoint.tipo] ?? checkpoint.tipo}
            {checkpoint.ausente ? " (sem GPS)" : ""}
          </li>
        ))}
      </ul>

      {encerrado && trajeto.kmIdaFinal && trajeto.kmVoltaFinal && (
        <>
          <h3>Valores consolidados</h3>
          <p>
            {formatarKm(trajeto.kmIdaFinal)} ida · {formatarKm(trajeto.kmVoltaFinal)} volta
            {trajeto.tempoFinal !== null ? ` · ${formatarDuracao(trajeto.tempoFinal)}` : ""}
          </p>
          {trajeto.justificativaDivergencia && (
            <p style={{ fontSize: "0.9rem" }}>Justificativa de divergência: {trajeto.justificativaDivergencia}</p>
          )}
        </>
      )}
    </section>
  );
}
