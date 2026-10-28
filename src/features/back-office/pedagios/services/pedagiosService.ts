import { requisitar } from "../../../../shared/services/httpClient";
import type { PracaPedagio, ValorPedagio } from "../types";

export const listarPracas = () => requisitar<PracaPedagio[]>("/api/v1/pracas-pedagio");
export const criarPraca = (corpo: { nome: string; valor: number; vigenteDesde: string; latitude?: number; longitude?: number }) =>
  requisitar<PracaPedagio>("/api/v1/pracas-pedagio", { metodo: "POST", corpo });
export const definirLocalizacaoDaPraca = (id: string, latitude: number | null, longitude: number | null) =>
  requisitar<PracaPedagio>(`/api/v1/pracas-pedagio/${id}/localizacao`, { metodo: "PUT", corpo: { latitude, longitude } });
export const historicoDaPraca = (id: string) => requisitar<ValorPedagio[]>(`/api/v1/pracas-pedagio/${id}/valores`);
export const adicionarValor = (id: string, corpo: { valor: number; vigenteDesde: string }) =>
  requisitar<ValorPedagio>(`/api/v1/pracas-pedagio/${id}/valores`, { metodo: "POST", corpo });
