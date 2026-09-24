import type { RotaSelecionada } from "../types";
import { formatarDistancia, formatarDuracao } from "./MapaRotas";

/**
 * Início da viagem (HU04, FR-001), encadeado à seleção de rota de HU03: o
 * cálculo da rota escolhida vira o {@code CalculoRota} inicial do trajeto,
 * junto com o checkpoint de partida.
 */
export function IniciarViagem({
  selecao,
  aoIniciar,
  ocupado = false,
}: {
  selecao: RotaSelecionada;
  aoIniciar: () => void;
  ocupado?: boolean;
}) {
  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h2>Rota escolhida</h2>
      <p>
        {formatarDistancia(selecao.rotaEscolhida.distanciaMetros)} · {formatarDuracao(selecao.rotaEscolhida.duracaoSegundos)} ·{" "}
        {selecao.tipoSelecao === "PROPRIA" ? "rota própria" : "rota sugerida"}
      </p>
      {selecao.justificativa && <p style={{ fontSize: "0.9rem" }}>Justificativa: {selecao.justificativa}</p>}

      <button onClick={aoIniciar} disabled={ocupado}>
        {ocupado ? "Iniciando…" : "Iniciar viagem"}
      </button>
    </section>
  );
}
