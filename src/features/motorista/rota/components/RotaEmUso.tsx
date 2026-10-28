import { formatarHora } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import type { CalculoRota } from "../types";
import { formatarDistancia, formatarDuracao } from "../utils/formatarRota";

/**
 * Rota que está valendo na viagem em andamento (HU04): o último cálculo do
 * histórico do trajeto. Sem isto, a lista de alternativas recalculadas ao
 * abrir a tela não dizia qual delas o motorista estava seguindo.
 */
export function RotaEmUso({ calculo }: { calculo: CalculoRota }) {
  const hora = formatarHora(calculo.dataHora);
  const t = useTextos().motorista.rota;

  return (
    <section className="mt-4">
      <h2>{t.rotaEmUso}</h2>
      <div className="cartao">
        <div className="dados-grade">
          <div>
            <div className="texto-apoio">{t.ida}</div>
            <div className="destaque">{formatarDistancia(Number(calculo.kmIda) * 1000)}</div>
          </div>
          <div>
            <div className="texto-apoio">{t.tempoEstimado}</div>
            {/* A rota própria não passa pelo motor de rotas: não há tempo estimado (o servidor grava 0). */}
            <div className="destaque">{calculo.origemSelecao === "PROPRIA" ? t.naoEstimado : formatarDuracao(calculo.tempoEstimado)}</div>
          </div>
          <div>
            <div className="texto-apoio">{t.tipo}</div>
            <div className="destaque">{calculo.origemSelecao === "PROPRIA" ? t.rotaPropria : t.sugerida}</div>
          </div>
        </div>
        <p className="texto-apoio mb-0 mt-2">{calculo.ehRotaInicial ? t.escolhidaNoInicio(hora) : t.trocadaDurante(hora)}</p>
      </div>
    </section>
  );
}
