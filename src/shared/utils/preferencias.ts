/**
 * Preferências de leitura guardadas neste aparelho: tamanho do texto, alto
 * contraste e tema. Fica fora do componente para que todas as cópias do
 * painel (barra lateral e rodapé do back-office, Conta do motorista, login)
 * leiam e alterem o mesmo estado, e para o main.tsx aplicar tudo antes de
 * renderizar.
 */

export const FONTE_MIN = 87.5;
export const FONTE_MAX = 150;
export const PASSO_FONTE = 12.5;

export type Tema = "automatico" | "claro" | "escuro";

export type Preferencias = { fonte: number; contraste: boolean; tema: Tema };

// A chave do tema também é lida pelo script do <head> do index.html (evita piscar o tema errado ao abrir).
const CHAVE_FONTE = "milebag_fonte_pct";
const CHAVE_CONTRASTE = "milebag_alto_contraste";
const CHAVE_TEMA = "milebag_tema";

const EVENTO = "milebag:preferencias";
const CONSULTA_ESCURO = "(prefers-color-scheme: dark)";

function ler(chave: string): string | null {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}

function gravar(chave: string, valor: string) {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    // Armazenamento bloqueado (modo privativo): a preferência vale só nesta sessão.
  }
}

function lerPreferencias(): Preferencias {
  const fonte = Number(ler(CHAVE_FONTE));
  const tema = ler(CHAVE_TEMA);
  return {
    fonte: fonte >= FONTE_MIN && fonte <= FONTE_MAX ? fonte : 100,
    contraste: ler(CHAVE_CONTRASTE) === "true",
    tema: tema === "claro" || tema === "escuro" ? tema : "automatico",
  };
}

// useSyncExternalStore exige o mesmo objeto enquanto nada muda.
let atual = lerPreferencias();

function aplicar({ fonte, contraste, tema }: Preferencias) {
  const raiz = document.documentElement;
  raiz.style.fontSize = fonte === 100 ? "" : `${fonte}%`;
  if (contraste) {
    raiz.dataset.altoContraste = "true";
  } else {
    delete raiz.dataset.altoContraste;
  }
  // O CSS só conhece "claro" e "escuro": "automático" é resolvido aqui, consultando o sistema.
  const escuro = tema === "escuro" || (tema === "automatico" && window.matchMedia(CONSULTA_ESCURO).matches);
  raiz.dataset.tema = escuro ? "escuro" : "claro";
  // Cor da barra do sistema (app instalado): a mesma do fundo definido no CSS, sem repetir o valor aqui.
  const fundo = getComputedStyle(raiz).getPropertyValue("--fundo-app").trim();
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.content = fundo;
  });
}

function atualizar(mudanca: Partial<Preferencias>) {
  atual = { ...atual, ...mudanca };
  gravar(CHAVE_FONTE, String(atual.fonte));
  gravar(CHAVE_CONTRASTE, String(atual.contraste));
  gravar(CHAVE_TEMA, atual.tema);
  aplicar(atual);
  window.dispatchEvent(new Event(EVENTO));
}

export function obterPreferencias(): Preferencias {
  return atual;
}

export function assinarPreferencias(aoMudar: () => void): () => void {
  window.addEventListener(EVENTO, aoMudar);
  return () => window.removeEventListener(EVENTO, aoMudar);
}

export function mudarFonte(novo: number) {
  atualizar({ fonte: Math.min(FONTE_MAX, Math.max(FONTE_MIN, novo)) });
}

export function alternarContraste() {
  atualizar({ contraste: !atual.contraste });
}

export function escolherTema(tema: Tema) {
  atualizar({ tema });
}

/** Reaplica ao abrir o app as preferências salvas (chamado em main.tsx, antes de renderizar) e acompanha o tema do sistema. */
export function aplicarPreferenciasSalvas() {
  atual = lerPreferencias();
  aplicar(atual);
  window.matchMedia(CONSULTA_ESCURO).addEventListener("change", () => {
    if (atual.tema === "automatico") {
      aplicar(atual);
    }
  });
}
