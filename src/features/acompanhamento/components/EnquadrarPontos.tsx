import { latLngBounds } from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { Coordenada } from "../../../shared/components/MapaBase";

/**
 * Reenquadra o mapa sempre que um ponto muda (HU31): o motorista anda, e sem isso ele sairia da área visível,
 * que o mapa base só calcula ao abrir.
 */
export function EnquadrarPontos({ pontos }: { pontos: Coordenada[] }) {
  const mapa = useMap();
  const chave = pontos.map((p) => `${p.latitude},${p.longitude}`).join(";");

  useEffect(() => {
    if (pontos.length >= 2) {
      mapa.fitBounds(latLngBounds(pontos.map((p) => [p.latitude, p.longitude])), { padding: [32, 32], maxZoom: 17 });
    } else if (pontos.length === 1) {
      mapa.setView([pontos[0].latitude, pontos[0].longitude], mapa.getZoom());
    }
    // `chave` resume as coordenadas: o array novo a cada consulta não deve reenquadrar sem movimento.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapa, chave]);

  return null;
}
