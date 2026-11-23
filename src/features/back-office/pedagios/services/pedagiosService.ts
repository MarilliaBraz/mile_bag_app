import { requisitar } from "../../../../shared/services/httpClient";
import type { PracaPedagio, ValorPedagio } from "../types";
import { caminhoApi } from "../../../../shared/services/caminhoApi";

export const listarPracas = () => requisitar<PracaPedagio[]>("/api/v1/pracas-pedagio");
export const criarPraca = (corpo: { nome: string; valor: number; vigenteDesde: string; latitude?: number; longitude?: number }) =>
  requisitar<PracaPedagio>("/api/v1/pracas-pedagio", { metodo: "POST", corpo });
export const definirLocalizacaoDaPraca = (id: string, latitude: number | null, longitude: number | null) =>
  requisitar<PracaPedagio>(caminhoApi`/api/v1/pracas-pedagio/${id}/localizacao`, { metodo: "PUT", corpo: { latitude, longitude } });
/** Corrige o nome da praça; as viagens já encerradas guardam o nome antigo. */
export const renomearPraca = (id: string, nome: string) =>
  requisitar<PracaPedagio>(caminhoApi`/api/v1/pracas-pedagio/${id}/nome`, { metodo: "PUT", corpo: { nome } });
export const historicoDaPraca = (id: string) => requisitar<ValorPedagio[]>(caminhoApi`/api/v1/pracas-pedagio/${id}/valores`);
export const adicionarValor = (id: string, corpo: { valor: number; vigenteDesde: string }) =>
  requisitar<ValorPedagio>(caminhoApi`/api/v1/pracas-pedagio/${id}/valores`, { metodo: "POST", corpo });
