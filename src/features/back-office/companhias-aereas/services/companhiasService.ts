import { requisitar } from "../../../../shared/services/httpClient";
import type { CompanhiaAerea, EmpresaParceira, NovaCompanhia } from "../types";
import { caminhoApi } from "../../../../shared/services/caminhoApi";

export const listarCompanhias = () => requisitar<CompanhiaAerea[]>("/api/v1/plataforma/companhias-aereas");
export const cadastrarCompanhia = (corpo: NovaCompanhia) =>
  requisitar<CompanhiaAerea>("/api/v1/plataforma/companhias-aereas", { metodo: "POST", corpo });
export const listarParceiras = (companhiaId: string) =>
  requisitar<EmpresaParceira[]>(caminhoApi`/api/v1/plataforma/companhias-aereas/${companhiaId}/parceiras`);
export const definirParceiras = (companhiaId: string, empresas: string[]) =>
  requisitar<EmpresaParceira[]>(caminhoApi`/api/v1/plataforma/companhias-aereas/${companhiaId}/parceiras`, {
    metodo: "PUT",
    corpo: { empresas },
  });
