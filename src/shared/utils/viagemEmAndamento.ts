/**
 * Marca, neste aparelho, que o motorista tem viagem em andamento (HU31) e de qual entrega (item 9): só com ela o app lê
 * o GPS - para o link "Acompanhe sua bagagem" e para gravar o caminho percorrido. Ligada ao iniciar a viagem ou ao ver
 * entrega em andamento no painel; desligada ao finalizar a entrega neste aparelho (mesmo sem internet) ou quando a API
 * responde que não há viagem. Um evento avisa o hook de envio, montado em todas as telas do motorista.
 */

const CHAVE = "milebag_viagem_em_andamento";
/** Valor das versões anteriores ao item 9, que não guardavam a entrega. */
const SEM_ENTREGA = "1";
export const EVENTO_VIAGEM = "milebag:viagem-em-andamento";

function ler(): string | null {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

export function temViagemEmAndamento(): boolean {
  return ler() !== null;
}

/** Item 9: a entrega em viagem neste aparelho, se conhecida. */
export function entregaEmViagem(): string | null {
  const valor = ler();
  return valor && valor !== SEM_ENTREGA ? valor : null;
}

export function marcarViagemEmAndamento(emAndamento: boolean, entregaId?: string): void {
  const atual = ler();
  const novo = emAndamento ? (entregaId ?? atual ?? SEM_ENTREGA) : null;
  if (novo === atual) {
    return;
  }
  try {
    if (novo) {
      localStorage.setItem(CHAVE, novo);
    } else {
      localStorage.removeItem(CHAVE);
    }
  } catch {
    // Armazenamento bloqueado (modo privativo): sem a marca, a posição não é enviada.
    return;
  }
  window.dispatchEvent(new Event(EVENTO_VIAGEM));
}

/** Item 9: a viagem desta entrega terminou neste aparelho (comprovante, ocorrência, dispensa): para de gravar o caminho. */
export function encerrarViagemNoAparelho(entregaId: string): void {
  const atual = ler();
  if (atual === entregaId || atual === SEM_ENTREGA) {
    marcarViagemEmAndamento(false);
  }
}
