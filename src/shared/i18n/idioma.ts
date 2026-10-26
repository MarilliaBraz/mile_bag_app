import { useSyncExternalStore } from "react";
import { en } from "./textos/en";
import { es } from "./textos/es";
import { pt, type Textos } from "./textos/pt";

/**
 * Idioma da interface, escolhido pelas bandeiras (SeletorIdioma) e lembrado
 * neste aparelho, como as preferências de leitura. O português é a
 * referência: es.ts e en.ts têm o mesmo formato de pt.ts, e o build falha
 * se faltar alguma tradução.
 */

export type Idioma = "pt-BR" | "es" | "en";

export const IDIOMAS: Idioma[] = ["pt-BR", "es", "en"];

const TEXTOS: Record<Idioma, Textos> = { "pt-BR": pt, es, en };

/** Item de menu: guarda a chave do texto, e o rótulo sai no idioma da vez. */
export type ChaveMenu = Exclude<keyof Textos["menu"], "atalho">;

const CHAVE_IDIOMA = "milebag_idioma";
const EVENTO = "milebag:idioma";

function lerIdioma(): Idioma {
  try {
    const salvo = localStorage.getItem(CHAVE_IDIOMA);
    return IDIOMAS.includes(salvo as Idioma) ? (salvo as Idioma) : "pt-BR";
  } catch {
    return "pt-BR";
  }
}

let atual = lerIdioma();

function aplicar(idioma: Idioma) {
  // Leitores de tela e a tradução automática do navegador seguem o lang da página.
  document.documentElement.lang = idioma;
}

export function obterIdioma(): Idioma {
  return atual;
}

export function assinarIdioma(aoMudar: () => void): () => void {
  window.addEventListener(EVENTO, aoMudar);
  return () => window.removeEventListener(EVENTO, aoMudar);
}

export function escolherIdioma(idioma: Idioma) {
  atual = idioma;
  try {
    localStorage.setItem(CHAVE_IDIOMA, idioma);
  } catch {
    // Armazenamento bloqueado (modo privativo): o idioma vale só nesta sessão.
  }
  aplicar(idioma);
  window.dispatchEvent(new Event(EVENTO));
}

/** Reaplica ao abrir o app o idioma salvo (chamado em main.tsx, antes de renderizar). */
export function aplicarIdiomaSalvo() {
  atual = lerIdioma();
  aplicar(atual);
}

/** Textos no idioma atual, para código fora dos componentes (serviços, mensagens de erro). */
export function obterTextos(): Textos {
  return TEXTOS[atual];
}

/** Localidade do Intl (datas, números e moeda) que acompanha o idioma: inglês segue o formato americano. */
export function localeAtual(): string {
  return atual === "en" ? "en-US" : atual;
}

export function useIdioma(): Idioma {
  return useSyncExternalStore(assinarIdioma, obterIdioma);
}

/** Textos da interface no idioma escolhido; a tela é redesenhada quando o idioma muda. */
export function useTextos(): Textos {
  return TEXTOS[useIdioma()];
}
