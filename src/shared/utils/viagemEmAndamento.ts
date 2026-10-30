/**
 * Marca, neste aparelho, que o motorista tem viagem em andamento (HU31): só com ela o app lê o GPS para o link
 * "Acompanhe sua bagagem". Ligada ao iniciar a viagem ou ao ver entrega em andamento no painel; desligada quando a
 * API responde que não há viagem. Um evento avisa o hook de envio, montado em todas as telas do motorista.
 */

const CHAVE = "milebag_viagem_em_andamento";
export const EVENTO_VIAGEM = "milebag:viagem-em-andamento";

export function temViagemEmAndamento(): boolean {
  try {
    return localStorage.getItem(CHAVE) === "1";
  } catch {
    return false;
  }
}

export function marcarViagemEmAndamento(emAndamento: boolean): void {
  if (emAndamento === temViagemEmAndamento()) {
    return;
  }
  try {
    if (emAndamento) {
      localStorage.setItem(CHAVE, "1");
    } else {
      localStorage.removeItem(CHAVE);
    }
  } catch {
    // Armazenamento bloqueado (modo privativo): sem a marca, a posição não é enviada.
    return;
  }
  window.dispatchEvent(new Event(EVENTO_VIAGEM));
}
