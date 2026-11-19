/**
 * Reduz a foto da câmera antes do envio: a do celular tem de 3 a 8 MB e 4000 px ou mais no lado maior, o que pesa
 * nos dados móveis do motorista e na fila offline (a foto fica guardada no aparelho até sincronizar). Com 2560 px no
 * lado maior, um BDO ou um comprovante continuam legíveis para o OCR e para quem confere.
 *
 * O JPEG gerado aqui não leva os metadados da foto original (GPS, data). Por isso NÃO usar em fotos cujo GPS a API
 * lê, como as de bagagem encontrada (HU34/HU35).
 *
 * Qualquer falha (navegador sem suporte, formato que o navegador não abre, como HEIC no Android) devolve a foto
 * original: reduzir é uma economia, nunca motivo para a foto não ser enviada.
 */
const LADO_MAXIMO = 2560;
const QUALIDADE_JPEG = 0.85;
/** Abaixo disso a foto já é leve: reprocessar só perderia qualidade. */
const TAMANHO_SEM_REDUCAO = 1.5 * 1024 * 1024;

export async function reduzirFoto(foto: File): Promise<File> {
  if (!foto.type.startsWith("image/") || foto.type === "image/gif" || foto.size <= TAMANHO_SEM_REDUCAO) {
    return foto;
  }
  try {
    const imagem = await createImageBitmap(foto, { imageOrientation: "from-image" });
    const escala = Math.min(1, LADO_MAXIMO / Math.max(imagem.width, imagem.height));
    const tela = document.createElement("canvas");
    tela.width = Math.round(imagem.width * escala);
    tela.height = Math.round(imagem.height * escala);
    const contexto = tela.getContext("2d");
    if (!contexto) {
      imagem.close();
      return foto;
    }
    contexto.drawImage(imagem, 0, 0, tela.width, tela.height);
    imagem.close();
    const reduzida = await new Promise<Blob | null>((resolver) => tela.toBlob(resolver, "image/jpeg", QUALIDADE_JPEG));
    if (!reduzida || reduzida.size >= foto.size) {
      return foto;
    }
    const nome = foto.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([reduzida], nome, { type: "image/jpeg", lastModified: foto.lastModified });
  } catch {
    return foto;
  }
}
