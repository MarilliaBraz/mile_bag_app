import { requisitar } from "../../../../shared/services/httpClient";
import type { PainelCompanhia, PainelCompanhiaGestao } from "../types";

/** Rascunhos (o administrador vê os da companhia; o funcionário, os seus), não encaminhadas e o andamento das encaminhadas. */
export const obterPainelCompanhia = () => requisitar<PainelCompanhia>("/api/v1/companhia/painel");

/** Painel de gestão (fase 1): prazo da ANAC, tempos, custódia, aeroportos e o que agir agora. */
export const obterPainelCompanhiaGestao = () => requisitar<PainelCompanhiaGestao>("/api/v1/companhia/painel/gestao");
