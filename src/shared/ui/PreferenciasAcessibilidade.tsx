import { useState } from "react";
import { Icone } from "./Icone";

const CHAVE_FONTE = "milebag_fonte_pct";
const CHAVE_CONTRASTE = "milebag_alto_contraste";
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

/** Reaplica ao abrir o app as preferências de leitura salvas neste aparelho (chamado em main.tsx, antes de renderizar). */
export function aplicarPreferenciasSalvas() {
  aplicarFonte(fonteSalva());
  aplicarContraste(ler(CHAVE_CONTRASTE) === "true");
}

/**
 * Preferências de leitura para baixa visão: tamanho do texto e alto contraste,
 * lembradas neste aparelho. Complementam o zoom do navegador e o modo escuro/
 * alto contraste do sistema, que o CSS já respeita.
 */
export function PreferenciasAcessibilidade() {
  const [fonte, setFonte] = useState(fonteSalva);
  const [contraste, setContraste] = useState(() => ler(CHAVE_CONTRASTE) === "true");

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
    <details className="ajuda nao-imprimir">
      <summary>Acessibilidade: tamanho do texto e contraste</summary>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", padding: "0.25rem 0 0.5rem" }}>
        <button type="button" className="secundario" onClick={() => mudarFonte(fonte - PASSO)} disabled={fonte <= FONTE_MIN} aria-label="Diminuir o tamanho do texto">
          A−
        </button>
        <button type="button" className="secundario" onClick={() => mudarFonte(fonte + PASSO)} disabled={fonte >= FONTE_MAX} aria-label="Aumentar o tamanho do texto">
          A+
        </button>
        <button type="button" className="secundario" onClick={alternarContraste} aria-pressed={contraste}>
          <Icone nome="contraste" /> Alto contraste
        </button>
        <span role="status" className="texto-apoio" style={{ alignSelf: "center" }}>
          Texto em {fonte}%{contraste ? " · alto contraste ligado" : ""}
        </span>
      </div>
    </details>
  );
}
