import { useTextos } from "../../../../shared/i18n/idioma";
import { Icone } from "../../../../shared/ui/Icone";
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
  const t = useTextos().motorista.rota;
  return (
    <section className="cartao mt-4">
      <div className="texto-apoio">{t.rotaEscolhida(selecao.tipoSelecao === "PROPRIA" ? t.tipoPropria : t.tipoSugerida)}</div>
      <p className="destaque">
        {formatarDuracao(selecao.rotaEscolhida.duracaoSegundos)} · {formatarDistancia(selecao.rotaEscolhida.distanciaMetros)}
      </p>
      {selecao.justificativa && <p className="texto-apoio">{t.justificativa(selecao.justificativa)}</p>}

      <button type="button" className="grande bloco" onClick={aoIniciar} disabled={ocupado}>
        <Icone nome="carro" /> {ocupado ? t.iniciando : t.iniciarViagem}
      </button>
    </section>
  );
}
