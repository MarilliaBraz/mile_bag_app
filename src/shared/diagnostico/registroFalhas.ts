/**
 * Falhas inesperadas guardadas no próprio aparelho (RNF11): servem para
 * conferir, depois de uma jornada de teste, se o app travou em alguma tela -
 * nada é enviado ao servidor. Guarda só as últimas, para não crescer sem fim.
 */
export type FalhaRegistrada = {
  dataHora: string;
  tela: string;
  mensagem: string;
};

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

export function registrarFalha(erro: unknown): void {
  const mensagem = erro instanceof Error ? erro.message : String(erro);
  const falha: FalhaRegistrada = { dataHora: new Date().toISOString(), tela: window.location.pathname, mensagem: mensagem.slice(0, 300) };
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
