import type { Coordenada } from "../components/MapaBase";

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
    if (lerRetiradaAguardandoViagem()?.entregaId === entregaId) {
      localStorage.removeItem(CHAVE_AGUARDANDO);
    }
  } catch {
    // Nada a limpar sem armazenamento local.
  }
}

/**
 * Retirada feita e viagem ainda não iniciada (online ou na fila): guarda onde e quando, para o app avisar o motorista
 * que se afastar do local sem iniciar a viagem (entrega GYNLA25237: saiu do aeroporto e a corrida não foi registrada).
 * `posicao` nula: a retirada foi sem localização - a primeira leitura do GPS depois dela vira a referência.
 */
export type RetiradaAguardandoViagem = { entregaId: string; posicao: Coordenada | null; registradaEm: number };

const CHAVE_AGUARDANDO = "milebag.retirada.aguardando-viagem";

export function marcarRetiradaAguardandoViagem(retirada: RetiradaAguardandoViagem): void {
  try {
    localStorage.setItem(CHAVE_AGUARDANDO, JSON.stringify(retirada));
  } catch {
    // Sem armazenamento local, não há aviso - a viagem continua podendo ser iniciada normalmente.
  }
}

export function lerRetiradaAguardandoViagem(): RetiradaAguardandoViagem | null {
  try {
    const valor = localStorage.getItem(CHAVE_AGUARDANDO);
    return valor ? (JSON.parse(valor) as RetiradaAguardandoViagem) : null;
  } catch {
    return null;
  }
}
