import { requisitar } from "../../../../shared/services/httpClient";
import type { PagamentoPendente } from "../types";

/** Motoristas com quinzena calculada ainda não paga, de todos os fechamentos (agendados primeiro). */
export const listarPagamentosPendentes = () => requisitar<PagamentoPendente[]>("/api/v1/fechamentos/pagamentos-pendentes");
