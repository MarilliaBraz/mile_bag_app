/**
 * BDOs que já tocaram o aviso neste aparelho (HU32): o mesmo BDO não avisa duas vezes, nem ao reabrir o app.
 * Na primeira consulta do aparelho, os BDOs que já estavam disponíveis entram como vistos, sem aviso.
 */

const CHAVE = "milebag_bdos_avisados";
const LIMITE = 300;

// Cópia em memória: com o armazenamento bloqueado (modo privativo) o aviso ainda funciona nesta sessão.
let vistos: string[] | null = null;

function ler(): string[] | null {
  try {
    const texto = localStorage.getItem(CHAVE);
    return texto ? (JSON.parse(texto) as string[]) : null;
  } catch {
    return null;
  }
}

function gravar(ids: string[]): void {
  vistos = ids.slice(0, LIMITE);
  try {
    localStorage.setItem(CHAVE, JSON.stringify(vistos));
  } catch {
    // Só em memória.
  }
}

/** Marca os BDOs como vistos e devolve os que ainda não tinham sido. */
export function registrarBdosVistos(ids: string[]): string[] {
  vistos ??= ler();
  if (vistos === null) {
    gravar(ids);
    return [];
  }
  const conhecidos = new Set(vistos);
  const novos = ids.filter((id) => !conhecidos.has(id));
  if (novos.length > 0) {
    gravar([...novos, ...vistos]);
  }
  return novos;
}
