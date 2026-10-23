import { MapaBase } from "../../../../shared/mapa/MapaBase";
import { Vazio } from "../../../../shared/ui/Alerta";
import { Icone } from "../../../../shared/ui/Icone";
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
  const indiceMaisRapida = calculo.alternativas.reduce(
    (melhor, alternativa, indice, todas) => (alternativa.duracaoSegundos < todas[melhor].duracaoSegundos ? indice : melhor),
    0,
  );

  return (
    <section>
      <MapaBase
        centro={calculo.destino}
        descricao="Mapa com a sua posição e o endereço de entrega"
        marcadores={[
          { posicao: calculo.origem, rotulo: "Sua posição" },
          { posicao: calculo.destino, rotulo: "Endereço de entrega" },
        ]}
      />

      <h2>Escolha a rota</h2>
      {calculo.alternativas.length === 0 ? (
        <Vazio icone="rota" titulo="Nenhuma rota encontrada">
          Tente recalcular ou trace uma rota própria.
        </Vazio>
      ) : (
        <ul className="lista" style={{ gap: "0.5rem" }}>
          {calculo.alternativas.map((alternativa, indice) => {
            const selecionada = alternativa.id === alternativaSelecionada;
            const maisRapida = indice === indiceMaisRapida;
            return (
              <li key={alternativa.id}>
                <button type="button" className="opcao" onClick={() => aoSelecionar(alternativa)} aria-pressed={selecionada}>
                  <span className="flex-1">
                    <span style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "0.25rem 0.75rem" }}>
                      <strong className="fs-g">{formatarDuracao(alternativa.duracaoSegundos)}</strong>
                      <span>{formatarDistancia(alternativa.distanciaMetros)}</span>
                    </span>
                    <span style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginTop: "0.375rem" }}>
                      {maisRapida && calculo.alternativas.length > 1 && <span className="selo selo-sucesso">Mais rápida</span>}
                      <span className={`selo${alternativa.possuiPedagio ? " selo-aviso" : ""}`}>
                        {alternativa.possuiPedagio ? "Com pedágio" : "Sem pedágio"}
                      </span>
                    </span>
                    {alternativa.pracasPedagio.length > 0 && (
                      <span className="texto-apoio" style={{ display: "block", marginTop: "0.375rem" }}>
                        {alternativa.pracasPedagio
                          .map((praca) => (praca.valor === null ? praca.nome : `${praca.nome} (${REAL.format(praca.valor)})`))
                          .join(" · ")}
                      </span>
                    )}
                    {alternativa.possuiPedagio && alternativa.pracasPedagio.length === 0 && (
                      <span className="texto-apoio" style={{ display: "block", marginTop: "0.375rem" }}>
                        Nenhuma praça cadastrada neste trecho: o reembolso ficará pendente.
                      </span>
                    )}
                  </span>
                  <span className="marcador" aria-hidden="true">
                    {selecionada && <Icone nome="check" />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
