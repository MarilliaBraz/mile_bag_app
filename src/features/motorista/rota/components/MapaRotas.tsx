import type { ReactNode } from "react";
import { Polyline } from "react-leaflet";
import { formatarMoeda } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { MapaBase } from "../../../../shared/components/MapaBase";
import { Vazio } from "../../../../shared/components/Alerta";
import { Icone } from "../../../../shared/components/Icone";
import type { CalculoRotas, RotaAlternativa } from "../types";
import { formatarDistancia, formatarDuracao } from "../utils/formatarRota";

function indiceDaMaisRapida(calculo: CalculoRotas): number {
  return calculo.alternativas.reduce(
    (melhor, alternativa, indice, todas) => (alternativa.duracaoSegundos < todas[melhor].duracaoSegundos ? indice : melhor),
    0,
  );
}

/**
 * Mapa com a posição do motorista, o endereço de entrega e o caminho de cada alternativa (HU03, FR-001/FR-002). A
 * escolhida fica em destaque; antes da escolha, a mais rápida.
 */
export function MapaRotas({ calculo, alternativaSelecionada }: { calculo: CalculoRotas; alternativaSelecionada: string | null }) {
  const t = useTextos().motorista.rota;
  const idEmDestaque = alternativaSelecionada ?? calculo.alternativas[indiceDaMaisRapida(calculo)]?.id;
  // A destacada por último, para ficar por cima das outras.
  const tracados = [...(calculo.tracados ?? [])].sort(
    (a, b) => Number(a.alternativaId === idEmDestaque) - Number(b.alternativaId === idEmDestaque),
  );

  return (
    <MapaBase
      centro={calculo.destino}
      descricao={t.mapaPosicaoEndereco}
      marcadores={[
        { posicao: calculo.origem, rotulo: t.suaPosicao },
        { posicao: calculo.destino, rotulo: t.enderecoEntrega },
      ]}
    >
      {tracados.map(({ alternativaId, pontos }) => (
        <Polyline
          // O Leaflet só aplica a classe ao criar a linha: trocar o destaque recria.
          key={`${alternativaId}-${alternativaId === idEmDestaque}`}
          positions={pontos.map((ponto) => [ponto.latitude, ponto.longitude])}
          className={alternativaId === idEmDestaque ? "tracado-rota" : "tracado-rota tracado-rota-alternativa"}
        />
      ))}
    </MapaBase>
  );
}

/**
 * Alternativas calculadas (HU03, FR-001/FR-002) - tempo, distância e indicador de pedágio. Fica recolhida na tela de
 * rota ("Ver outras rotas"): a mais rápida já vem escolhida e o caminho principal é só "Iniciar viagem".
 */
export function ListaRotas({
  calculo,
  alternativaSelecionada,
  aoSelecionar,
  children,
}: {
  calculo: CalculoRotas;
  alternativaSelecionada: string | null;
  aoSelecionar: (alternativa: RotaAlternativa) => void;
  /** Texto de apoio antes da lista (ex.: o que acontece ao trocar de rota durante a viagem). */
  children?: ReactNode;
}) {
  const t = useTextos().motorista.rota;
  const indiceMaisRapida = indiceDaMaisRapida(calculo);

  if (calculo.motorRotasDisponivel === false) {
    return (
      <Vazio icone="alerta" titulo={t.servicoIndisponivel}>
        {t.servicoIndisponivelDica}
      </Vazio>
    );
  }
  if (calculo.alternativas.length === 0) {
    return (
      <Vazio icone="rota" titulo={t.nenhumaRota}>
        {t.nenhumaRotaDica}
      </Vazio>
    );
  }

  return (
    <>
      {children}
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
                    {maisRapida && calculo.alternativas.length > 1 && <span className="selo selo-sucesso">{t.maisRapida}</span>}
                    <span className={`selo${alternativa.possuiPedagio ? " selo-aviso" : ""}`}>
                      {alternativa.possuiPedagio ? t.comPedagio : t.semPedagio}
                    </span>
                  </span>
                  {alternativa.pracasPedagio.length > 0 && (
                    <span className="texto-apoio" style={{ display: "block", marginTop: "0.375rem" }}>
                      {alternativa.pracasPedagio
                        .map((praca) => (praca.valor === null ? praca.nome : `${praca.nome} (${formatarMoeda(praca.valor)})`))
                        .join(" · ")}
                    </span>
                  )}
                  {alternativa.possuiPedagio && alternativa.pracasPedagio.length === 0 && (
                    <span className="texto-apoio" style={{ display: "block", marginTop: "0.375rem" }}>
                      {t.semPracaCadastrada}
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
    </>
  );
}
