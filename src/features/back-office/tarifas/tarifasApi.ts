import { requisitar } from "../../../shared/api/httpClient";

/** Espelha com.marillia.milebag.business.tarifa.model.EscopoTarifa. */
export type EscopoTarifa = "PADRAO" | "MOTORISTA" | "REGIAO";

/** Espelha TarifaResponse. Valores e datas de vigência vêm do servidor como número e AAAA-MM-DD. */
export type Tarifa = {
  id: string;
  escopo: EscopoTarifa;
  motoristaId: string | null;
  regiao: string | null;
  valorFixo: number | null;
  valorPorKm: number | null;
  vigenteDesde: string;
};

export type NovaTarifa = {
  escopo: EscopoTarifa;
  motoristaId?: string;
  regiao?: string;
  valorFixo: number | null;
  valorPorKm: number | null;
  vigenteDesde: string;
};

export type AlteracaoTarifa = Pick<NovaTarifa, "valorFixo" | "valorPorKm" | "vigenteDesde">;

export const listarTarifas = () => requisitar<Tarifa[]>("/api/v1/tarifas");
export const criarTarifa = (corpo: NovaTarifa) => requisitar<Tarifa>("/api/v1/tarifas", { metodo: "POST", corpo });
export const atualizarTarifa = (id: string, corpo: AlteracaoTarifa) =>
  requisitar<Tarifa>(`/api/v1/tarifas/${id}`, { metodo: "PUT", corpo });
export const removerTarifa = (id: string) => requisitar<void>(`/api/v1/tarifas/${id}`, { metodo: "DELETE" });
