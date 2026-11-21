/**
 * Marca, neste aparelho, que a retirada da bagagem já foi registrada (online ou na fila offline), para a tela de rota
 * liberar o início da viagem mesmo sem conexão. O servidor continua sendo quem decide: sem retirada ele recusa a viagem.
 */
const chave = (entregaId: string) => `milebag.retirada.${entregaId}`;

export function marcarRetiradaLocal(entregaId: string): void {
  try {
    localStorage.setItem(chave(entregaId), "1");
  } catch {
    // Sem armazenamento local, a tela só depende da resposta do servidor.
  }
}

export function temRetiradaLocal(entregaId: string): boolean {
  try {
    return localStorage.getItem(chave(entregaId)) === "1";
  } catch {
    return false;
  }
}

/** A viagem começou: a retirada desta tentativa já foi usada (uma nova tentativa pede outra). */
export function limparRetiradaLocal(entregaId: string): void {
  try {
    localStorage.removeItem(chave(entregaId));
  } catch {
    // Nada a limpar sem armazenamento local.
  }
}
