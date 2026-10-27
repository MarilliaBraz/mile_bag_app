import { useState } from "react";
import { useMapEvents } from "react-leaflet";
import { useTextos } from "../../../../shared/i18n/idioma";
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
  const t = useTextos().motorista.rota;

  return (
    <section>
      <Alerta tipo="aviso">{t.enderecoNaoLocalizado}</Alerta>

      <MapaBase
        centro={destino ?? centroInicial}
        descricao={t.mapaMarcarEndereco}
        marcadores={destino ? [{ posicao: destino, rotulo: t.enderecoEntrega }] : []}
      >
        <CapturarClique aoClicar={setDestino} />
      </MapaBase>

      <button type="button" className="grande bloco mt-3" onClick={() => destino && aoConfirmar(destino)} disabled={!destino || ocupado}>
        {ocupado ? t.calculandoCurto : destino ? t.calcularAteAqui : t.toqueParaMarcar}
      </button>
    </section>
  );
}
