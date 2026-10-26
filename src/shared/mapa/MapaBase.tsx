import "leaflet/dist/leaflet.css";
import iconeSombra from "leaflet/dist/images/marker-shadow.png";
import icone2x from "leaflet/dist/images/marker-icon-2x.png";
import icone from "leaflet/dist/images/marker-icon.png";
import { Icon, latLngBounds } from "leaflet";
import { useState, type ReactNode } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

/** Coordenada geográfica (WGS84); espelha com.marillia.milebag.core.geo.Coordenada. */
export type Coordenada = {
  latitude: number;
  longitude: number;
};

export type MarcadorMapa = {
  posicao: Coordenada;
  rotulo: string;
};

// Vite não resolve as URLs que o Leaflet monta sozinho em tempo de execução:
// sem apontar os ícones importados aqui, os marcadores saem como imagem
// quebrada (problema conhecido do Leaflet com empacotadores).
const ICONE_PADRAO = new Icon({
  iconUrl: icone,
  iconRetinaUrl: icone2x,
  shadowUrl: iconeSombra,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/**
 * Mapa base (Leaflet sobre OpenStreetMap) reutilizado pelas telas de rota
 * e viagem - atribuição do OSM sempre visível (RI08), exigida pela licença
 * dos dados. Não há nenhum link ou botão que abra um app de mapas externo
 * (HU03, FR-008): toda a navegação exibida ao motorista vem dos cálculos
 * do próprio sistema.
 */
export function MapaBase({
  centro,
  marcadores = [],
  zoom = 13,
  altura = 280,
  descricao = "Mapa",
  children,
}: {
  centro: Coordenada;
  marcadores?: MarcadorMapa[];
  zoom?: number;
  altura?: number;
  /** Nome do mapa para leitores de tela; a mesma informação deve existir em texto na tela. */
  descricao?: string;
  children?: ReactNode;
}) {
  const [enquadramento] = useState(() =>
    marcadores.length >= 2 ? latLngBounds(marcadores.map((m) => [m.posicao.latitude, m.posicao.longitude])) : undefined,
  );

  return (
    <div role="region" aria-label={descricao} className="mapa">
    <MapContainer
      center={enquadramento ? undefined : [centro.latitude, centro.longitude]}
      zoom={enquadramento ? undefined : zoom}
      // Com dois ou mais pontos (ex.: sua posição e o destino), o mapa abre enquadrando todos eles.
      bounds={enquadramento}
      boundsOptions={{ padding: [32, 32] }}
      // A roda do mouse rola a página, não dá zoom: senão quem rola a tela fica preso no mapa.
      // O zoom continua pelos botões +/−, pinça e toque duplo.
      scrollWheelZoom={false}
      style={{ height: altura, width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {marcadores.map((marcador) => (
        <Marker
          key={`${marcador.rotulo}-${marcador.posicao.latitude}-${marcador.posicao.longitude}`}
          position={[marcador.posicao.latitude, marcador.posicao.longitude]}
          icon={ICONE_PADRAO}
        >
          <Popup>{marcador.rotulo}</Popup>
        </Marker>
      ))}
      {children}
    </MapContainer>
    </div>
  );
}
