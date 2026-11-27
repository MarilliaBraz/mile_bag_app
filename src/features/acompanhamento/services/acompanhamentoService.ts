import { requisitar } from "../../../shared/services/httpClient";
import type { Acompanhamento, Avaliacao } from "../types";
import { caminhoApi } from "../../../shared/services/caminhoApi";

/** Público (sem login): o código do link é a única credencial. */
export function consultarAcompanhamento(codigo: string): Promise<Acompanhamento> {
  return requisitar<Acompanhamento>(caminhoApi`/api/v1/acompanhamento/${codigo}`);
}

/** V65: pesquisa de satisfação, uma por entrega, só depois da entrega. */
export function avaliarEntrega(codigo: string, avaliacao: Avaliacao): Promise<void> {
  return requisitar<void>(caminhoApi`/api/v1/acompanhamento/${codigo}/avaliacao`, { metodo: "POST", corpo: avaliacao });
}
