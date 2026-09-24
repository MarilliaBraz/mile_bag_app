import { requisitar } from "../../../shared/api/httpClient";

/** Espelha PracaPedagioResponse; `valorVigente` é nulo quando só há valores com vigência futura. */
export type PracaPedagio = {
  id: string;
  nome: string;
  valorVigente: number | null;
  vigenteDesde: string | null;
};

/** Espelha ValorPedagioResponse. */
export type ValorPedagio = { valor: number; vigenteDesde: string };

export const listarPracas = () => requisitar<PracaPedagio[]>("/api/v1/pracas-pedagio");
export const criarPraca = (corpo: { nome: string; valor: number; vigenteDesde: string }) =>
  requisitar<PracaPedagio>("/api/v1/pracas-pedagio", { metodo: "POST", corpo });
export const historicoDaPraca = (id: string) => requisitar<ValorPedagio[]>(`/api/v1/pracas-pedagio/${id}/valores`);
export const adicionarValor = (id: string, corpo: { valor: number; vigenteDesde: string }) =>
  requisitar<ValorPedagio>(`/api/v1/pracas-pedagio/${id}/valores`, { metodo: "POST", corpo });
