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
    <section style={{ marginTop: "1.5rem" }}>
      <h2>Usar uma rota própria</h2>
      <p style={{ fontSize: "0.9rem" }}>Toque no mapa para marcar os pontos do caminho que você vai fazer.</p>

      <MapaBase
        centro={centro}
        marcadores={tracado.map((ponto, indice) => ({ posicao: ponto, rotulo: `Ponto ${indice + 1}` }))}
      >
        <CapturarCliques aoClicar={(ponto) => setTracado((atual) => [...atual, ponto])} />
      </MapaBase>

      <p style={{ fontSize: "0.9rem" }}>
        {tracado.length} ponto(s) marcado(s){" "}
        {tracado.length > 0 && (
          <button className="secundario" onClick={() => setTracado((atual) => atual.slice(0, -1))} style={{ marginLeft: "0.5rem" }}>
            Desfazer último
          </button>
        )}
      </p>

      <label htmlFor="justificativa-rota">Justificativa *</label>
      <textarea
        id="justificativa-rota"
        rows={3}
        value={justificativa}
        onChange={(evento) => setJustificativa(evento.target.value)}
        placeholder="Por que esta rota é melhor que as sugeridas?"
      />

      <button onClick={() => aoConfirmar(tracado, justificativa.trim())} disabled={!podeConfirmar} style={{ marginTop: "0.75rem" }}>
        Usar esta rota
      </button>
    </section>
  );
}
