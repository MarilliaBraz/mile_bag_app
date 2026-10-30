import { requisitar } from "../../../shared/services/httpClient";
import type { Acompanhamento } from "../types";

/** Público (sem login): o código do link é a única credencial. */
export function consultarAcompanhamento(codigo: string): Promise<Acompanhamento> {
  return requisitar<Acompanhamento>(`/api/v1/acompanhamento/${encodeURIComponent(codigo)}`);
}
