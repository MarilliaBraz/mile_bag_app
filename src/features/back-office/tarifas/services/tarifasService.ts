import { requisitar } from "../../../../shared/services/httpClient";
import type { AlteracaoTarifa, NovaTarifa, Tarifa } from "../types";
import { caminhoApi } from "../../../../shared/services/caminhoApi";

export const listarTarifas = () => requisitar<Tarifa[]>("/api/v1/tarifas");
export const criarTarifa = (corpo: NovaTarifa) => requisitar<Tarifa>("/api/v1/tarifas", { metodo: "POST", corpo });
export const atualizarTarifa = (id: string, corpo: AlteracaoTarifa) =>
  requisitar<Tarifa>(caminhoApi`/api/v1/tarifas/${id}`, { metodo: "PUT", corpo });
export const removerTarifa = (id: string) => requisitar<void>(caminhoApi`/api/v1/tarifas/${id}`, { metodo: "DELETE" });
