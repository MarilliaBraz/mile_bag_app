import { requisitar } from "../../../../shared/services/httpClient";
import type { CompanhiaAerea, NovaCompanhia } from "../types";

export const listarCompanhias = () => requisitar<CompanhiaAerea[]>("/api/v1/plataforma/companhias-aereas");
export const cadastrarCompanhia = (corpo: NovaCompanhia) =>
  requisitar<CompanhiaAerea>("/api/v1/plataforma/companhias-aereas", { metodo: "POST", corpo });
