import { MapaBase } from "../../../../shared/mapa/MapaBase";
import type { CalculoRotas, RotaAlternativa } from "../types";

const REAL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarDistancia(metros: number): string {
  return `${(metros / 1000).toFixed(1).replace(".", ",")} km`;
}

export function formatarDuracao(segundos: number): string {
  const minutos = Math.round(segundos / 60);
  if (minutos < 60) {
    return `${minutos} min`;
  }
  return `${Math.floor(minutos / 60)} h ${String(minutos % 60).padStart(2, "0")} min`;
}

/**
 * Alternativas de rota calculadas (HU03, FR-001/FR-002) - distância, tempo
 * estimado e indicador de pedágio, com o mapa posicionando origem e destino.
 *
 * <p>O mapa não desenha o traçado de cada alternativa: o back-end extrai do
 * motor de rotas apenas o resumo de cada opção (ver {@code RotaAlternativa}),
 * sem a polilinha - a comparação entre elas é feita pelos números.</p>
 */
export function MapaRotas({
  calculo,
  alternativaSelecionada,
  aoSelecionar,
}: {
  calculo: CalculoRotas;
  alternativaSelecionada: string | null;
  aoSelecionar: (alternativa: RotaAlternativa) => void;
}) {
  return (
    <section>
      <MapaBase
        centro={calculo.destino}
        marcadores={[
          { posicao: calculo.origem, rotulo: "Sua posição" },
          { posicao: calculo.destino, rotulo: "Endereço de entrega" },
        ]}
      />

      <h2>Rotas sugeridas</h2>
      {calculo.alternativas.length === 0 ? (
        <p>Nenhuma alternativa de rota foi encontrada para este trecho.</p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {calculo.alternativas.map((alternativa) => {
            const selecionada = alternativa.id === alternativaSelecionada;
            return (
              <li key={alternativa.id} style={{ marginBottom: "0.5rem" }}>
                <button
                  onClick={() => aoSelecionar(alternativa)}
                  aria-pressed={selecionada}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: selecionada ? "var(--acao)" : "transparent",
                    color: selecionada ? "#fff" : "var(--texto)",
                    border: `1px solid ${selecionada ? "var(--acao)" : "var(--borda)"}`,
                  }}
                >
                  <strong>{formatarDistancia(alternativa.distanciaMetros)}</strong> · {formatarDuracao(alternativa.duracaoSegundos)}
                  {alternativa.possuiPedagio ? " · 🛣️ com pedágio" : " · sem pedágio"}
                  {alternativa.pracasPedagio.length > 0 && (
                    <div style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                      {alternativa.pracasPedagio
                        .map((praca) => (praca.valor === null ? praca.nome : `${praca.nome} (${REAL.format(praca.valor)})`))
                        .join(" · ")}
                    </div>
                  )}
                  {alternativa.possuiPedagio && alternativa.pracasPedagio.length === 0 && (
                    <div style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>Nenhuma praça cadastrada neste trecho: o reembolso ficará pendente.</div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
