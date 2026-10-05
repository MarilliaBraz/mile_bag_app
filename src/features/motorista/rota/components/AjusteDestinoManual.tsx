import { useState } from "react";
import { useMapEvents } from "react-leaflet";
import { Alerta } from "../../../../shared/ui/Alerta";
import { MapaBase } from "../../../../shared/mapa/MapaBase";
import type { Coordenada } from "../types";

function CapturarClique({ aoClicar }: { aoClicar: (ponto: Coordenada) => void }) {
  useMapEvents({
    click: (evento) => aoClicar({ latitude: evento.latlng.lat, longitude: evento.latlng.lng }),
  });
  return null;
}

/**
 * Ajuste manual do ponto de entrega (HU03, FR-006 / Edge Case) - exibido
 * quando o back-end responde 422 por não conseguir geocodificar o endereço
 * do BDO. O motorista toca no mapa para indicar onde é a entrega e o
 * cálculo é refeito com essa coordenada.
 */
export function AjusteDestinoManual({
  centroInicial,
  aoConfirmar,
  ocupado = false,
}: {
  centroInicial: Coordenada;
  aoConfirmar: (destino: Coordenada) => void;
  ocupado?: boolean;
}) {
  const [destino, setDestino] = useState<Coordenada | null>(null);

  return (
    <section>
      <Alerta tipo="aviso">Não foi possível localizar automaticamente o endereço deste BDO. Toque no mapa para marcar onde é a entrega.</Alerta>

      <MapaBase
        centro={destino ?? centroInicial}
        descricao="Mapa para marcar o endereço de entrega"
        marcadores={destino ? [{ posicao: destino, rotulo: "Endereço de entrega" }] : []}
      >
        <CapturarClique aoClicar={setDestino} />
      </MapaBase>

      <button type="button" className="grande bloco" onClick={() => destino && aoConfirmar(destino)} disabled={!destino || ocupado} style={{ marginTop: "0.75rem" }}>
        {ocupado ? "Calculando…" : destino ? "Calcular rota até aqui" : "Toque no mapa para marcar o endereço"}
      </button>
    </section>
  );
}
