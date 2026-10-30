import type { Coordenada } from "../components/MapaBase";
import { requisitar } from "./httpClient";

/** HU31: `rastreando = false` quando o motorista não tem viagem em andamento - o app para de enviar. */
export function enviarPosicao(posicao: Coordenada): Promise<{ rastreando: boolean }> {
  return requisitar<{ rastreando: boolean }>("/api/v1/motorista/posicao", { metodo: "POST", corpo: posicao });
}
