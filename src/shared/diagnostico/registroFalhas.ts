/**
 * Falhas inesperadas guardadas no próprio aparelho (RNF11): servem para
 * conferir, depois de uma jornada de teste, se o app travou em alguma tela -
 * nada é enviado ao servidor. Guarda só as últimas, para não crescer sem fim.
 */
export type FalhaRegistrada = {
  dataHora: string;
  tela: string;
  mensagem: string;
  /** Onde aconteceu: primeiras linhas da pilha e, na renderização, o componente. Sem isso, uma falha sem reprodução não tem como ser investigada. */
  local?: string;
};

const LINHAS_DE_LOCAL = 6;

function resumirLocal(erro: unknown, pilhaDeComponentes?: string | null): string | undefined {
  const pilha = erro instanceof Error ? erro.stack : undefined;
  const linhas = [
    ...(pilha?.split("\n").slice(1, LINHAS_DE_LOCAL) ?? []),
    ...(pilhaDeComponentes?.trim().split("\n").slice(0, LINHAS_DE_LOCAL) ?? []),
  ].map((linha) => linha.trim());
  return linhas.length > 0 ? linhas.join("\n").slice(0, 1_000) : undefined;
}

const CHAVE = "milebag.falhasRecentes";
const LIMITE = 20;

export function listarFalhas(): FalhaRegistrada[] {
  try {
    const texto = localStorage.getItem(CHAVE);
    return texto ? (JSON.parse(texto) as FalhaRegistrada[]) : [];
  } catch {
    return [];
  }
}

export function registrarFalha(erro: unknown, pilhaDeComponentes?: string | null): void {
  const mensagem = erro instanceof Error ? erro.message : String(erro);
  const falha: FalhaRegistrada = {
    dataHora: new Date().toISOString(),
    tela: window.location.pathname,
    mensagem: mensagem.slice(0, 300),
    local: resumirLocal(erro, pilhaDeComponentes),
  };
  try {
    localStorage.setItem(CHAVE, JSON.stringify([falha, ...listarFalhas()].slice(0, LIMITE)));
  } catch {
    // Sem armazenamento local não há onde guardar; a tela de recuperação continua funcionando.
  }
}

export function limparFalhas(): void {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    // idem
  }
}

/**
 * Erros fora da renderização (promessa sem tratamento, erro em evento) não
 * derrubam a tela, mas também ficam registrados. Chamado uma vez em main.tsx.
 */
export function registrarFalhasGlobais(): void {
  window.addEventListener("error", (evento) => registrarFalha(evento.error ?? evento.message));
  window.addEventListener("unhandledrejection", (evento) => registrarFalha(evento.reason));
}
