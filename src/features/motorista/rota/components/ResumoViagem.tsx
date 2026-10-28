import { formatarHora, formatarNumero } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import type { TrajetoDetalhado } from "../types";
import { formatarDuracao } from "../utils/formatarRota";

const horaDe = formatarHora;

function formatarKm(valor: string): string {
  return `${formatarNumero(Number(valor), 1)} km`;
}

/**
 * Estado atual do trajeto e histórico de cálculos de rota (HU04) - os
 * valores finais (km, tempo, pedágios) só existem depois do encerramento,
 * então ficam ocultos enquanto o trajeto está em execução.
 */
export function ResumoViagem({ trajeto }: { trajeto: TrajetoDetalhado }) {
  const encerrado = trajeto.status === "ENCERRADO";
  const t = useTextos().motorista.rota;

  return (
    <section>
      <h2>{encerrado ? t.viagemEncerrada : t.viagemEmAndamento}</h2>
      <div className="cartao">
        {encerrado && trajeto.kmIdaFinal && trajeto.kmVoltaFinal && (
          <div className="dados-grade mb-4">
            <div>
              <div className="texto-apoio">{t.ida}</div>
              <div className="destaque">{formatarKm(trajeto.kmIdaFinal)}</div>
            </div>
            <div>
              <div className="texto-apoio">{t.volta}</div>
              <div className="destaque">{formatarKm(trajeto.kmVoltaFinal)}</div>
            </div>
            {trajeto.tempoFinal !== null && (
              <div>
                <div className="texto-apoio">{t.tempo}</div>
                <div className="destaque">{formatarDuracao(trajeto.tempoFinal)}</div>
              </div>
            )}
          </div>
        )}
        {encerrado && trajeto.justificativaDivergencia && (
          <p className="texto-apoio">{t.justificativaDivergenciaValor(trajeto.justificativaDivergencia)}</p>
        )}

        <h3>{t.linhaDoTempo(horaDe(trajeto.dataInicio))}</h3>
        <ol className="linha-tempo">
          {trajeto.checkpoints.map((checkpoint) => (
            <li key={checkpoint.id}>
              <strong>{t.checkpoints[checkpoint.tipo] ?? checkpoint.tipo}</strong>{" "}
              <span className="texto-apoio">
                {horaDe(checkpoint.dataHora)}
                {checkpoint.ausente ? t.semGps : ""}
              </span>
            </li>
          ))}
        </ol>

        <details className="ajuda sem-icone">
          <summary>{t.calculos(trajeto.calculosRota.length)}</summary>
          <ul className="linha-tempo">
            {trajeto.calculosRota.map((calculo) => (
              <li key={calculo.id}>
                <strong>{calculo.ehRotaInicial ? t.rotaInicial : t.recalculo}</strong>
                {calculo.origemSelecao === "PROPRIA" ? t.propriaEntreParenteses : ""}{" "}
                <span className="texto-apoio">{horaDe(calculo.dataHora)}</span>
                <div className="texto-apoio">
                  {t.idaVolta(formatarKm(calculo.kmIda), formatarKm(calculo.kmVolta))}
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
