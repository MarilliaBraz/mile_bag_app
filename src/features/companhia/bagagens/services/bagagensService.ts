import { baixarArquivo, enviarFormulario, requisitar } from "../../../../shared/services/httpClient";
import type { Coordenada } from "../../../../shared/components/MapaBase";
import type { Aeroporto, BagagemEncontrada, ConfirmacaoEtiqueta, Descrever } from "../types";

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

export const buscarBagagem = (id: string) => requisitar<BagagemEncontrada>(`${BASE}/${id}`);
export const confirmarEtiqueta = (id: string, corpo: ConfirmacaoEtiqueta) =>
  requisitar<BagagemEncontrada>(`${BASE}/${id}/confirmacao`, { metodo: "PUT", corpo });
export const descreverBagagem = (id: string, corpo: Descrever) =>
  requisitar<BagagemEncontrada>(`${BASE}/${id}/descricao`, { metodo: "PUT", corpo });
export const descartarBagagem = (id: string) => requisitar<void>(`${BASE}/${id}`, { metodo: "DELETE" });
export const listarRascunhos = () => requisitar<BagagemEncontrada[]>(`${BASE}?situacao=RASCUNHO`);
export const listarRecentes = () => requisitar<BagagemEncontrada[]>(`${BASE}?situacao=REGISTRADA`);
export const listarAeroportos = () => requisitar<Aeroporto[]>("/api/v1/aeroportos");
/** A foto exige o cabeçalho de autorização: não dá para usar a URL direto no <img>. */
export const baixarFoto = (bagagem: BagagemEncontrada) => baixarArquivo(bagagem.fotoUrl);
/** QR code do código SID (HU35), também com o cabeçalho de autorização. */
export const baixarQr = (bagagem: BagagemEncontrada) => baixarArquivo(bagagem.qrUrl ?? "");
