import { requisitar } from "../../../../shared/services/httpClient";
import type { AlteracaoTarifa, NovaTarifa, Tarifa } from "../types";

export const listarTarifas = () => requisitar<Tarifa[]>("/api/v1/tarifas");
export const criarTarifa = (corpo: NovaTarifa) => requisitar<Tarifa>("/api/v1/tarifas", { metodo: "POST", corpo });
export const atualizarTarifa = (id: string, corpo: AlteracaoTarifa) =>
  requisitar<Tarifa>(`/api/v1/tarifas/${id}`, { metodo: "PUT", corpo });
export const removerTarifa = (id: string) => requisitar<void>(`/api/v1/tarifas/${id}`, { metodo: "DELETE" });
