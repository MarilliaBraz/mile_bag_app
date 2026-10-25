import type { CalculoRota } from "../types";
import { formatarDistancia, formatarDuracao } from "./MapaRotas";

/**
 * Rota que está valendo na viagem em andamento (HU04): o último cálculo do
 * histórico do trajeto. Sem isto, a lista de alternativas recalculadas ao
 * abrir a tela não dizia qual delas o motorista estava seguindo.
 */
export function RotaEmUso({ calculo }: { calculo: CalculoRota }) {
  const hora = new Date(calculo.dataHora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <section className="mt-4">
      <h2>Rota em uso</h2>
      <div className="cartao">
        <div className="dados-grade">
          <div>
            <div className="texto-apoio">Ida</div>
            <div className="destaque">{formatarDistancia(Number(calculo.kmIda) * 1000)}</div>
          </div>
          <div>
            <div className="texto-apoio">Tempo estimado</div>
            <div className="destaque">{formatarDuracao(calculo.tempoEstimado)}</div>
          </div>
          <div>
            <div className="texto-apoio">Tipo</div>
            <div className="destaque">{calculo.origemSelecao === "PROPRIA" ? "Rota própria" : "Sugerida"}</div>
          </div>
        </div>
        <p className="texto-apoio mb-0 mt-2">
          {calculo.ehRotaInicial ? "Escolhida no início da viagem" : "Trocada durante a viagem"}, às {hora}.
        </p>
      </div>
    </section>
  );
}
