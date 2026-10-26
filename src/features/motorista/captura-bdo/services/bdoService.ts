import { enviarFormulario, requisitar } from "../../../../shared/api/httpClient";
import type { BdoResponse, CamposExtraidosBdo } from "../types";

/** POST /api/v1/bdos (HU01, FR-002/FR-003/FR-006). */
export function capturarBdo(imagem: File): Promise<BdoResponse> {
  const dados = new FormData();
  dados.append("imagem", imagem);
  return enviarFormulario<BdoResponse>("/api/v1/bdos", dados);
}

/** PATCH /api/v1/bdos/{id}/conferencia (HU01, FR-004/FR-005). */
export function confirmarConferencia(id: string, campos: CamposExtraidosBdo): Promise<BdoResponse> {
  return requisitar<BdoResponse>(`/api/v1/bdos/${id}/conferencia`, { metodo: "PATCH", corpo: campos });
}

/** GET /api/v1/bdos/pendentes-conferencia (HU01/HU08): fotos do motorista ainda sem conferência, inclusive as tiradas sem internet. */
export function listarPendentesDeConferencia(): Promise<BdoResponse[]> {
  return requisitar<BdoResponse[]>("/api/v1/bdos/pendentes-conferencia");
}

/** DELETE /api/v1/bdos/{id} (HU01): descarta a captura ainda não confirmada (registro e foto). */
export function descartarCaptura(id: string): Promise<void> {
  return requisitar<void>(`/api/v1/bdos/${id}`, { metodo: "DELETE" });
}
