/**
 * Nome do ambiente (ex.: "Homologação") para a faixa do topo. A mesma imagem do app roda na homologação e na
 * produção, então o nome vem do servidor em tempo de execução: o Caddy responde /ambiente.json com o valor de
 * MILEBAG_AMBIENTE_ROTULO (vazio em produção). VITE_AMBIENTE, preenchida no build, vale primeiro (homologação local
 * com scripts/implantar.sh).
 */
const ROTULO_DO_BUILD = import.meta.env.VITE_AMBIENTE?.trim() ?? "";
const ENDERECO = "/ambiente.json";
const TAMANHO_MAXIMO = 64;

export function rotuloDoBuild(): string {
  return ROTULO_DO_BUILD;
}

/**
 * Lê o rótulo do servidor. Devolve "" quando não há rótulo: produção, servidor de desenvolvimento do Vite (sem
 * /ambiente.json) ou resposta fora do formato. A faixa é só um aviso; sem ela o app funciona igual.
 */
export async function lerRotuloDoServidor(sinal: AbortSignal): Promise<string> {
  let resposta: Response;
  try {
    resposta = await fetch(ENDERECO, { cache: "no-store", signal: sinal });
  } catch (erro) {
    if (!sinal.aborted) {
      console.warn("Não foi possível ler o ambiente do servidor:", erro);
    }
    return "";
  }
  if (!resposta.ok || !resposta.headers.get("content-type")?.includes("application/json")) {
    return "";
  }
  try {
    const dados: unknown = await resposta.json();
    const rotulo = (dados as { rotulo?: unknown } | null)?.rotulo;
    return typeof rotulo === "string" ? rotulo.trim().slice(0, TAMANHO_MAXIMO) : "";
  } catch (erro) {
    console.warn("Resposta inválida em /ambiente.json:", erro);
    return "";
  }
}
