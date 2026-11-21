import { baixarArquivo, requisitar } from "../../../../shared/services/httpClient";
import type { EntregaStatus } from "../../../motorista/painel-entregas/types";
import type { EntregaGestao, FotoEntrega, HistoricoEntrega } from "../types";
import { caminhoApi } from "../../../../shared/services/caminhoApi";

const BASE = "/api/v1/gestao/entregas";

/** GET /api/v1/gestao/entregas - as mais recentemente movimentadas primeiro; sem status, todas. */
export const listarEntregas = (status: EntregaStatus | null) =>
  requisitar<EntregaGestao[]>(status ? BASE + caminhoApi`?status=${status}` : BASE);

/** POST /api/v1/gestao/bdos/{bdoId}/cancelamento (V47) - motivo obrigatório da lista de cancelamento da empresa. */
export const cancelarBdo = (bdoId: string, motivoId: string, complemento: string | null) =>
  requisitar<unknown>(caminhoApi`/api/v1/gestao/bdos/${bdoId}/cancelamento`, { metodo: "POST", corpo: { motivoId, complemento } });

/** GET /api/v1/gestao/entregas/{id}/historico - a linha do tempo da mala. */
export const consultarHistorico = (entregaId: string) => requisitar<HistoricoEntrega>(BASE + caminhoApi`/${entregaId}/historico`);

/** GET /api/v1/gestao/entregas/{id}/fotos (V48) - retirada, porta, avarias e BDO assinado, na ordem em que foram tiradas. */
export const listarFotos = (entregaId: string) => requisitar<FotoEntrega[]>(BASE + caminhoApi`/${entregaId}/fotos`);

/** O arquivo de uma foto, baixado com o token (o <img> não manda o cabeçalho de autorização). */
export const baixarFoto = (entregaId: string, fotoId: string) => baixarArquivo(BASE + caminhoApi`/${entregaId}/fotos/${fotoId}`);
