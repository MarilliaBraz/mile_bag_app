import { baixarArquivo, requisitar } from "../../../../shared/services/httpClient";
import type { BdosDisponiveis, EntregaStatus, ItemPainelDetalhe, PainelEntregas } from "../types";
import { caminhoApi } from "../../../../shared/services/caminhoApi";

/** GET /api/v1/motorista/painel-entregas (HU19, FR-002). */
export function consultarPainel(): Promise<PainelEntregas> {
  return requisitar<PainelEntregas>("/api/v1/motorista/painel-entregas");
}

/** GET /api/v1/entregas/{entregaId}/detalhe (HU19, FR-003). */
export function consultarDetalhe(entregaId: string): Promise<ItemPainelDetalhe> {
  return requisitar<ItemPainelDetalhe>(caminhoApi`/api/v1/entregas/${entregaId}/detalhe`);
}

/** GET /api/v1/motorista/bdos-disponiveis (HU19, FR-007). */
export function consultarBdosDisponiveis(): Promise<BdosDisponiveis> {
  return requisitar<BdosDisponiveis>("/api/v1/motorista/bdos-disponiveis");
}

/** POST /api/v1/entregas/{bdoId}/autoatribuir (HU02, FR-009 desta HU). */
export function autoatribuir(bdoId: string): Promise<void> {
  return requisitar<void>(caminhoApi`/api/v1/entregas/${bdoId}/autoatribuir`, { metodo: "POST" });
}

/** GET /api/v1/entregas/{id}/segunda-via-bdo (V50) - o PDF da entrega que está com o motorista, com as caronas. */
export const baixarSegundaViaDaEntrega = (entregaId: string) => baixarArquivo(caminhoApi`/api/v1/entregas/${entregaId}/segunda-via-bdo`);

/** POST /api/v1/entregas/{id}/segunda-via-bdo/email (V50) - envia o PDF para imprimir onde houver impressora. */
export const enviarSegundaViaDaEntrega = (entregaId: string, email: string) =>
  requisitar<void>(caminhoApi`/api/v1/entregas/${entregaId}/segunda-via-bdo/email`, { metodo: "POST", corpo: { email } });

/** Item 4c: uma entrega do motorista achada pelo número do BDO (espelha EntregaEncontradaResponse). */
export type EntregaEncontrada = {
  entregaId: string;
  bdoNumero: string | null;
  status: EntregaStatus;
  passageiroNome: string | null;
  atualizadoEm: string;
  pagoEm: string | null;
};

/** GET /api/v1/motorista/entregas?bdoNumero= - só as entregas em que o motorista é o responsável. */
export const buscarMinhasEntregasPorNumero = (numero: string) =>
  requisitar<EntregaEncontrada[]>(caminhoApi`/api/v1/motorista/entregas?bdoNumero=${numero}`);
