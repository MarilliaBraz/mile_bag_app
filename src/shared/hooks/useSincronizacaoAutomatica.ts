import { liveQuery } from "dexie";
import { useCallback, useEffect, useState } from "react";
import { useIntervaloEmPrimeiroPlano } from "./useIntervaloEmPrimeiroPlano";
import { contarPendentes } from "../services/fila";
import { sincronizar } from "../services/sincronizador";
import { useConectividade } from "./useConectividade";

const INTERVALO_REFORCO_MS = 60_000;

/**
 * Sincronização automática da fila local (HU08, FR-004) - dispara na
 * transição para online e, como reforço enquanto online, em intervalo
 * periódico (para os registros que o servidor recusou e continuam na fila).
 * O motorista nunca precisa acionar nada manualmente. O reforço só roda com o
 * app visível (RNF11): em segundo plano não gasta bateria.
 *
 * <p>A contagem de pendentes é reativa ({@code liveQuery}): reflete um
 * registro enfileirado na hora, na mesma tela, sem depender de a tela ser
 * remontada (FR-003).</p>
 */
export function useSincronizacaoAutomatica(aoSincronizar?: () => void) {
  const online = useConectividade();
  const [pendentes, setPendentes] = useState(0);

  useEffect(() => {
    const assinatura = liveQuery(() => contarPendentes()).subscribe({
      next: setPendentes,
      error: () => undefined,
    });
    return () => assinatura.unsubscribe();
  }, []);

  const sincronizarAgora = useCallback(async () => {
    if (!navigator.onLine) {
      return;
    }
    try {
      const { enviados } = await sincronizar();
      // A tela que chamou mostra dados do servidor: depois que algo foi
      // efetivado (ex.: uma autoatribuição feita offline), ela precisa
      // recarregar para refletir o estado real.
      if (enviados > 0) {
        aoSincronizar?.();
      }
    } catch {
      // Sem conexão de novo no meio do envio: a fila continua intacta e a
      // próxima tentativa reenvia (FR-007).
    }
  }, [aoSincronizar]);

  useIntervaloEmPrimeiroPlano(sincronizarAgora, INTERVALO_REFORCO_MS, online);

  return { online, pendentes, sincronizarAgora };
}
