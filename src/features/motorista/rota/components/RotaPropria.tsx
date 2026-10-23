import { useState } from "react";
import { useMapEvents } from "react-leaflet";
import { MapaBase } from "../../../../shared/mapa/MapaBase";
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
 */
export function RotaPropria({
  centro,
  aoConfirmar,
  desabilitado = false,
}: {
  centro: Coordenada;
  aoConfirmar: (tracado: Coordenada[], justificativa: string) => void;
  desabilitado?: boolean;
}) {
  const [tracado, setTracado] = useState<Coordenada[]>([]);
  const [justificativa, setJustificativa] = useState("");

  const podeConfirmar = justificativa.trim().length > 0 && tracado.length > 0 && !desabilitado;

  return (
    <section>
      <p className="texto-apoio">Toque no mapa para marcar os pontos do caminho que você vai fazer.</p>

      <MapaBase
        centro={centro}
        descricao="Mapa para marcar os pontos da rota própria"
        marcadores={tracado.map((ponto, indice) => ({ posicao: ponto, rotulo: `Ponto ${indice + 1}` }))}
      >
        <CapturarCliques aoClicar={(ponto) => setTracado((atual) => [...atual, ponto])} />
      </MapaBase>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", margin: "0.5rem 0 1rem" }}>
        <span role="status" className="texto-apoio">
          {tracado.length} ponto(s) marcado(s)
        </span>
        {tracado.length > 0 && (
          <button type="button" className="fantasma" onClick={() => setTracado((atual) => atual.slice(0, -1))}>
            Desfazer último
          </button>
        )}
      </div>

      <label htmlFor="justificativa-rota">
        Justificativa{" "}
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
        placeholder="Por que esta rota é melhor que as sugeridas?"
      />

      <button type="button" className="bloco mt-3" onClick={() => aoConfirmar(tracado, justificativa.trim())} disabled={!podeConfirmar}>
        Usar esta rota
      </button>
    </section>
  );
}
