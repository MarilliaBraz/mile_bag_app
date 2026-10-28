import { requisitar } from "./httpClient";
import type { AlertaEmergencia, StatusAlertaEmergencia } from "../types/emergencia";

// Em shared/ porque duas aplicações usam: o motorista aciona e cancela, o
// back-office lista e atende (HU30, contracts/emergencia-api.md).

const BASE = "/api/v1/emergencias";

/** Disparado quando um alerta muda de situação nesta aba, para quem mostra a contagem atualizar na hora. */
export const EVENTO_ALERTAS_ALTERADOS = "milebag:alertas-emergencia-alterados";

export const acionarAlerta = (posicao: { latitude: number; longitude: number } | null) =>
  requisitar<AlertaEmergencia>(BASE, { metodo: "POST", corpo: posicao ?? {} });

/** `undefined` (204) quando o motorista não tem alerta aberto. */
export const consultarMeuAlertaAberto = () => requisitar<AlertaEmergencia | undefined>(`${BASE}/minha`);

export const cancelarAlerta = (id: string) => requisitar<AlertaEmergencia>(`${BASE}/${id}/cancelar`, { metodo: "POST" });

export const listarAlertas = (status?: StatusAlertaEmergencia) =>
  requisitar<AlertaEmergencia[]>(status ? `${BASE}?status=${status}` : BASE);

export async function atenderAlerta(id: string, observacao: string): Promise<AlertaEmergencia> {
  const alerta = await requisitar<AlertaEmergencia>(`${BASE}/${id}/atender`, { metodo: "POST", corpo: { observacao } });
  window.dispatchEvent(new Event(EVENTO_ALERTAS_ALTERADOS));
  return alerta;
}

export function linkMapa(alerta: Pick<AlertaEmergencia, "latitude" | "longitude">): string | null {
  return alerta.latitude !== null && alerta.longitude !== null
    ? `https://www.openstreetmap.org/?mlat=${alerta.latitude}&mlon=${alerta.longitude}#map=17/${alerta.latitude}/${alerta.longitude}`
    : null;
}
