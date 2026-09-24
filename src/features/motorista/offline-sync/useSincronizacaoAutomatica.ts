import { useCallback, useEffect, useState } from "react";
import { contarPendentes } from "./fila";
import { sincronizar } from "./sincronizador";
import { useConectividade } from "./useConectividade";

const INTERVALO_REFORCO_MS = 60_000;

/**
 * Sincronização automática da fila local (HU08, FR-004) - dispara na
 * transição para online e, como reforço enquanto online, em intervalo
 * periódico (para os registros que o servidor recusou e continuam na fila).
 * O motorista nunca precisa acionar nada manualmente.
 */
export function useSincronizacaoAutomatica() {
  const online = useConectividade();
  const [pendentes, setPendentes] = useState(0);

  const atualizarContagem = useCallback(async () => {
    setPendentes(await contarPendentes());
  }, []);

  const sincronizarAgora = useCallback(async () => {
    if (!navigator.onLine) {
      return;
    }
    try {
      await sincronizar();
    } catch {
      // Sem conexão de novo no meio do envio: a fila continua intacta e a
      // próxima tentativa reenvia (FR-007).
    }
    await atualizarContagem();
  }, [atualizarContagem]);

  useEffect(() => {
    atualizarContagem();
  }, [atualizarContagem, online]);

  useEffect(() => {
    if (!online) {
      return;
    }
    sincronizarAgora();
    const intervalo = setInterval(sincronizarAgora, INTERVALO_REFORCO_MS);
    return () => clearInterval(intervalo);
  }, [online, sincronizarAgora]);

  return { online, pendentes, sincronizarAgora, atualizarContagem };
}
