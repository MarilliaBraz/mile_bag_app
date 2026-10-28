import { useState } from "react";
import { CircleMarker, Polyline, useMapEvents } from "react-leaflet";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { MapaBase } from "../../../../shared/components/MapaBase";
import type { Coordenada } from "../types";

function CapturarCliques({ aoClicar }: { aoClicar: (ponto: Coordenada) => void }) {
  useMapEvents({
    click: (evento) => aoClicar({ latitude: evento.latlng.lat, longitude: evento.latlng.lng }),
  });
  return null;
}

/**
 * Traçado de uma rota própria (HU03, FR-004/FR-005) - o motorista toca no
 * mapa para marcar os pontos do caminho que pretende fazer e precisa
 * justificar a escolha: sem justificativa o back-end recusa a seleção (400),
 * então o botão fica bloqueado até o campo estar preenchido.
 *
 * <p>Os alfinetes mostram a posição do motorista e o endereço de entrega, só
 * como referência (e para o mapa abrir enquadrando os dois); os pontos
 * marcados aparecem ligados por uma linha, na ordem em que foram tocados.</p>
 */
export function RotaPropria({
  origem,
  destino,
  aoConfirmar,
  desabilitado = false,
}: {
  origem: Coordenada | null;
  destino: Coordenada;
  aoConfirmar: (tracado: Coordenada[], justificativa: string) => void;
  desabilitado?: boolean;
}) {
  const [tracado, setTracado] = useState<Coordenada[]>([]);
  const [justificativa, setJustificativa] = useState("");
  const t = useTextos().motorista.rota;

  const podeConfirmar = justificativa.trim().length > 0 && tracado.length > 0 && !desabilitado;
  const referencias = [...(origem ? [{ posicao: origem, rotulo: t.suaPosicao }] : []), { posicao: destino, rotulo: t.enderecoEntrega }];
  const posicoes = tracado.map((ponto) => [ponto.latitude, ponto.longitude] as [number, number]);

  return (
    <section>
      <p className="texto-apoio">{t.alfinetes}</p>

      <MapaBase centro={destino} descricao={t.mapaRotaPropria} marcadores={referencias}>
        <CapturarCliques aoClicar={(ponto) => setTracado((atual) => [...atual, ponto])} />
        {posicoes.length > 1 && <Polyline positions={posicoes} className="tracado-proprio" />}
        {posicoes.map((posicao, indice) => (
          <CircleMarker key={`${indice}-${posicao.join(",")}`} center={posicao} radius={6} className="tracado-proprio-ponto" />
        ))}
      </MapaBase>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", margin: "0.5rem 0 1rem" }}>
        <span role="status" className="texto-apoio">
          {t.pontosMarcados(tracado.length)}
        </span>
        {tracado.length > 0 && (
          <button type="button" className="fantasma" onClick={() => setTracado((atual) => atual.slice(0, -1))}>
            {t.desfazerUltimo}
          </button>
        )}
      </div>

      <label htmlFor="justificativa-rota">
        {t.campoJustificativa}{" "}
        <span className="campo-obrigatorio" aria-hidden="true">
          *
        </span>
      </label>
      <textarea
        id="justificativa-rota"
        aria-required="true"
        rows={3}
        value={justificativa}
        onChange={(evento) => setJustificativa(evento.target.value)}
        placeholder={t.porQueMelhor}
      />

      <button type="button" className="bloco mt-3" onClick={() => aoConfirmar(tracado, justificativa.trim())} disabled={!podeConfirmar}>
        {t.usarEstaRota}
      </button>
    </section>
  );
}
