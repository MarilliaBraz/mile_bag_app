import { baixarArquivo, requisitar } from "../../../../shared/services/httpClient";
import type { EntregaStatus } from "../../../motorista/painel-entregas/types";
import type { EntregaGestao, FotoEntrega, HistoricoEntrega } from "../types";
import { caminhoApi } from "../../../../shared/services/caminhoApi";
import type { BdoResponse, CamposBdo, DadosPassageiroBdo } from "../../../../shared/types/bdo";

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

const BDOS = "/api/v1/gestao/bdos";

/** POST /api/v1/gestao/bdos/leitura (V49) - lê o telex colado e devolve os campos para conferir; não grava. */
export const lerTextoBdo = (texto: string) => requisitar<CamposBdo>(BDOS + "/leitura", { metodo: "POST", corpo: { texto } });

/** GET /api/v1/gestao/bdos?numero= (V49) - BDOs já registrados com o número, para avisar antes de repetir. */
export const buscarBdosPorNumero = (numero: string) => requisitar<BdoResponse[]>(BDOS + caminhoApi`?numero=${numero}`);

/** POST /api/v1/gestao/bdos (V49) - a empresa inclui o BDO; ele entra nos disponíveis e os motoristas são avisados. */
export const incluirBdo = (campos: CamposBdo, textoOriginal: string | null) =>
  requisitar<BdoResponse>(BDOS, { metodo: "POST", corpo: { campos, textoOriginal } });

/** GET /api/v1/gestao/bdos/{bdoId}/segunda-via (V50) - o PDF da segunda via, gerado na hora. */
export const baixarSegundaVia = (bdoId: string) => baixarArquivo(caminhoApi`/api/v1/gestao/bdos/${bdoId}/segunda-via`);

/** POST /api/v1/gestao/bdos/{bdoId}/segunda-via/email (V50) - envia o PDF para imprimir; fica no histórico da mala. */
export const enviarSegundaVia = (bdoId: string, email: string) =>
  requisitar<void>(caminhoApi`/api/v1/gestao/bdos/${bdoId}/segunda-via/email`, { metodo: "POST", corpo: { email } });

/** POST /api/v1/gestao/bdos/{bdoId}/base (V52) - troca a base de um BDO que ninguém assumiu; motivo obrigatório. */
export const trocarBaseBdo = (bdoId: string, baseId: string, motivo: string) =>
  requisitar<void>(caminhoApi`/api/v1/gestao/bdos/${bdoId}/base`, { metodo: "POST", corpo: { baseId, motivo } });

/** GET /api/v1/gestao/bdos/{bdoId}/dados-passageiro (V59) - os dados atuais, com o logradouro separado de cidade, UF e CEP. */
export const consultarDadosPassageiro = (bdoId: string) =>
  requisitar<DadosPassageiroBdo>(caminhoApi`/api/v1/gestao/bdos/${bdoId}/dados-passageiro`);

/** PUT /api/v1/gestao/bdos/{bdoId}/dados-passageiro (V59) - corrige até a entrega ser concluída; motivo obrigatório. */
export const alterarDadosPassageiro = (bdoId: string, dados: DadosPassageiroBdo, motivo: string) =>
  requisitar<void>(caminhoApi`/api/v1/gestao/bdos/${bdoId}/dados-passageiro`, { metodo: "PUT", corpo: { dados, motivo } });
