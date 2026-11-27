import { baixarArquivo, enviarFormulario, requisitar } from "../../../../shared/services/httpClient";
import { hojeIso } from "../../../../shared/utils/formatar";
import type { Coordenada } from "../../../../shared/components/MapaBase";
import type {
  Aeroporto,
  BagagemEncontrada,
  BagagemNacional,
  ConfirmacaoEtiqueta,
  Descrever,
  EmpresaEntrega,
  EncaminharBagagem,
  CustoProcesso,
  EntregaParceiro,
  FiltrosConsulta,
  PaginaBagagens,
  TipoCusto,
} from "../types";
import { consultaQuery } from "../utils/filtrosConsulta";
import { salvarArquivo } from "../utils/salvarArquivo";
import { caminhoApi } from "../../../../shared/services/caminhoApi";

const BASE = "/api/v1/companhia/bagagens";

function formularioDaFoto(foto: File, posicao: Coordenada | null) {
  const dados = new FormData();
  dados.append("foto", foto);
  if (posicao) {
    dados.append("latitude", String(posicao.latitude));
    dados.append("longitude", String(posicao.longitude));
  }
  return dados;
}

/** Envia a foto da etiqueta (e a posição do celular, se houver); a API devolve o rascunho já lido (HU34). */
export const lerEtiqueta = (foto: File, posicao: Coordenada | null) =>
  enviarFormulario<BagagemEncontrada>(BASE, formularioDaFoto(foto, posicao));

/** Foto de bagagem sem etiqueta (HU35): a API devolve o rascunho com a cor sugerida e o local. */
export const lerSemEtiqueta = (foto: File, posicao: Coordenada | null) =>
  enviarFormulario<BagagemEncontrada>(`${BASE}/sem-etiqueta`, formularioDaFoto(foto, posicao));

export const buscarBagagem = (id: string) => requisitar<BagagemEncontrada>(BASE + caminhoApi`/${id}`);
export const confirmarEtiqueta = (id: string, corpo: ConfirmacaoEtiqueta) =>
  requisitar<BagagemEncontrada>(BASE + caminhoApi`/${id}/confirmacao`, { metodo: "PUT", corpo });
export const descreverBagagem = (id: string, corpo: Descrever) =>
  requisitar<BagagemEncontrada>(BASE + caminhoApi`/${id}/descricao`, { metodo: "PUT", corpo });
export const descartarBagagem = (id: string) => requisitar<void>(BASE + caminhoApi`/${id}`, { metodo: "DELETE" });
export const listarRascunhos = () => requisitar<BagagemEncontrada[]>(`${BASE}?situacao=RASCUNHO`);
export const listarRecentes = () => requisitar<BagagemEncontrada[]>(`${BASE}?situacao=REGISTRADA`);
export const listarAeroportos = () => requisitar<Aeroporto[]>("/api/v1/aeroportos");
/** A foto exige o cabeçalho de autorização: não dá para usar a URL direto no <img>. */
export const baixarFoto = (bagagem: BagagemEncontrada) => baixarArquivo(bagagem.fotoUrl);
/** QR code do código SID (HU35), também com o cabeçalho de autorização. */
export const baixarQr = (bagagem: BagagemEncontrada) => baixarArquivo(bagagem.qrUrl ?? "");

/** Painel da companhia (fase 2): comprovante, última tentativa, contato e rastreio da entrega do parceiro. */
export const obterEntregaParceiro = (id: string) => requisitar<EntregaParceiro>(BASE + caminhoApi`/${id}/entrega`);
/** Foto da entrega: exige o cabeçalho de autorização, então vem como arquivo. */
export const baixarFotoEntrega = (id: string, fotoId: string) => baixarArquivo(BASE + caminhoApi`/${id}/entrega/fotos/${fotoId}`);

/** Painel da companhia (fase 3): custos do processo (frete, vouchers, reembolsos, indenização). */
export const listarCustos = (id: string) => requisitar<CustoProcesso[]>(BASE + caminhoApi`/${id}/custos`);
export const lancarCusto = (id: string, corpo: { tipo: TipoCusto; valor: number; descricao?: string; data?: string }) =>
  requisitar<CustoProcesso>(BASE + caminhoApi`/${id}/custos`, { metodo: "POST", corpo });
export const removerCusto = (id: string, custoId: string) =>
  requisitar<void>(BASE + caminhoApi`/${id}/custos/${custoId}`, { metodo: "DELETE" });

/** HU36: consulta da companhia com filtros, 50 por página. */
export const consultarBagagens = (filtros: FiltrosConsulta, pagina: number) =>
  requisitar<PaginaBagagens>(`${BASE}/consulta?${consultaQuery(filtros, pagina)}`);

/** A mesma busca em planilha CSV. */
export async function exportarCsv(filtros: FiltrosConsulta): Promise<void> {
  salvarArquivo(await baixarArquivo(`${BASE}/consulta.csv?${consultaQuery(filtros)}`), `bagagens-encontradas-${hojeIso()}.csv`);
}

/** Ficha em PDF da bagagem registrada. */
export async function baixarFicha(bagagem: BagagemEncontrada): Promise<void> {
  const identificador = bagagem.descricao?.codigoSid ?? bagagem.etiqueta?.numeroEtiqueta ?? bagagem.id;
  salvarArquivo(await baixarArquivo(BASE + caminhoApi`/${bagagem.id}/ficha`), `ficha-${identificador}.pdf`);
}

/** Busca nacional por etiqueta (RD22): todas as companhias. */
export const buscarNoPais = (etiqueta: string) =>
  requisitar<BagagemNacional[]>(caminhoApi`/api/v1/companhia/busca-nacional?etiqueta=${etiqueta}`);

/** HU37: empresas de entrega parceiras da companhia, para o encaminhamento. */
export const listarEmpresasEntrega = () => requisitar<EmpresaEntrega[]>("/api/v1/companhia/empresas-entrega");
export const encaminharBagagem = (id: string, corpo: EncaminharBagagem) =>
  requisitar<BagagemEncontrada>(BASE + caminhoApi`/${id}/encaminhamento`, { metodo: "POST", corpo });
export const cancelarEncaminhamento = (id: string) => requisitar<void>(BASE + caminhoApi`/${id}/encaminhamento`, { metodo: "DELETE" });
