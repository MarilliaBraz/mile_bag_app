import { useState } from "react";
import { Icone } from "./Icone";

const CHAVE_FONTE = "milebag_fonte_pct";
const CHAVE_CONTRASTE = "milebag_alto_contraste";
const CHAVE_TEMA = "milebag_tema";

type Tema = "automatico" | "claro" | "escuro";

const TEMAS: { valor: Tema; rotulo: string }[] = [
  { valor: "automatico", rotulo: "Automático" },
  { valor: "claro", rotulo: "Claro" },
  { valor: "escuro", rotulo: "Escuro" },
];

// Cor da barra do sistema (PWA instalado) para cada tema; "automatico" volta às metas com media query do index.html.
const COR_BARRA: Record<Exclude<Tema, "automatico">, string> = { claro: "#f3f5f9", escuro: "#0b1220" };
const FONTE_MIN = 87.5;
const FONTE_MAX = 150;
const PASSO = 12.5;

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

function fonteSalva(): number {
  const salvo = Number(ler(CHAVE_FONTE));
  return salvo >= FONTE_MIN && salvo <= FONTE_MAX ? salvo : 100;
}

function aplicarFonte(pct: number) {
  document.documentElement.style.fontSize = pct === 100 ? "" : `${pct}%`;
}

function aplicarContraste(ligado: boolean) {
  if (ligado) {
    document.documentElement.dataset.altoContraste = "true";
  } else {
    delete document.documentElement.dataset.altoContraste;
  }
}

function temaSalvo(): Tema {
  const salvo = ler(CHAVE_TEMA);
  return salvo === "claro" || salvo === "escuro" ? salvo : "automatico";
}

/** "automatico" segue o sistema (prefers-color-scheme); "claro"/"escuro" forçam via data-tema, que o index.css lê. */
function aplicarTema(tema: Tema) {
  const raiz = document.documentElement;
  if (tema === "automatico") {
    delete raiz.dataset.tema;
  } else {
    raiz.dataset.tema = tema;
  }
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.dataset.original ??= meta.content;
    meta.content = tema === "automatico" ? meta.dataset.original : COR_BARRA[tema];
  });
}

/** Reaplica ao abrir o app as preferências de leitura salvas neste aparelho (chamado em main.tsx, antes de renderizar). */
export function aplicarPreferenciasSalvas() {
  aplicarFonte(fonteSalva());
  aplicarContraste(ler(CHAVE_CONTRASTE) === "true");
  aplicarTema(temaSalvo());
}

/**
 * Preferências de leitura para baixa visão: tamanho do texto e alto contraste,
 * lembradas neste aparelho. Complementam o zoom do navegador e o modo escuro/
 * alto contraste do sistema, que o CSS já respeita.
 */
export function PreferenciasAcessibilidade({ aberto = false }: { aberto?: boolean }) {
  const [fonte, setFonte] = useState(fonteSalva);
  const [contraste, setContraste] = useState(() => ler(CHAVE_CONTRASTE) === "true");
  const [tema, setTema] = useState<Tema>(temaSalvo);

  function escolherTema(novo: Tema) {
    setTema(novo);
    aplicarTema(novo);
    gravar(CHAVE_TEMA, novo);
  }

  function mudarFonte(novo: number) {
    const limitado = Math.min(FONTE_MAX, Math.max(FONTE_MIN, novo));
    setFonte(limitado);
    aplicarFonte(limitado);
    gravar(CHAVE_FONTE, String(limitado));
  }

  function alternarContraste() {
    const novo = !contraste;
    setContraste(novo);
    aplicarContraste(novo);
    gravar(CHAVE_CONTRASTE, String(novo));
  }

  return (
    <details className="ajuda sem-icone nao-imprimir" open={aberto}>
      <summary>
        <Icone nome="contraste" /> Texto, contraste e tema
      </summary>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
        <button type="button" className="secundario" onClick={() => mudarFonte(fonte - PASSO)} disabled={fonte <= FONTE_MIN} aria-label="Diminuir o tamanho do texto" style={{ minWidth: "var(--alvo-g)", fontSize: "0.9rem" }}>
          A−
        </button>
        <button type="button" className="secundario" onClick={() => mudarFonte(fonte + PASSO)} disabled={fonte >= FONTE_MAX} aria-label="Aumentar o tamanho do texto" style={{ minWidth: "var(--alvo-g)", fontSize: "1.2rem" }}>
          A+
        </button>
        <button type="button" className="secundario" onClick={alternarContraste} aria-pressed={contraste}>
          <Icone nome="contraste" /> Alto contraste
        </button>
        <div className="segmentado" role="group" aria-label="Tema" style={{ flexBasis: "100%" }}>
          {TEMAS.map((opcao) => (
            <button key={opcao.valor} type="button" aria-pressed={tema === opcao.valor} onClick={() => escolherTema(opcao.valor)} style={{ flex: 1 }}>
              {opcao.rotulo}
            </button>
          ))}
        </div>
        <span role="status" className="texto-apoio" style={{ flexBasis: "100%" }}>
          Texto em {fonte}%{contraste ? " · alto contraste ligado (o tema fica sempre claro)" : ""}
          {!contraste && tema !== "automatico" ? ` · tema ${tema}` : ""}
        </span>
      </div>
    </details>
  );
}
