import { requisitar } from "../../../../shared/services/httpClient";
import type { PainelCompanhia } from "../types";

/** Rascunhos (o administrador vê os da companhia; o funcionário, os seus), não encaminhadas e o andamento das encaminhadas. */
export const obterPainelCompanhia = () => requisitar<PainelCompanhia>("/api/v1/companhia/painel");
