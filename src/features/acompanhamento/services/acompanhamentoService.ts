import { requisitar } from "../../../shared/services/httpClient";
import type { Acompanhamento } from "../types";
import { caminhoApi } from "../../../shared/services/caminhoApi";

/** Público (sem login): o código do link é a única credencial. */
export function consultarAcompanhamento(codigo: string): Promise<Acompanhamento> {
  return requisitar<Acompanhamento>(caminhoApi`/api/v1/acompanhamento/${codigo}`);
}
