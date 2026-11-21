import { useEffect, useState } from "react";
import { consultarDetalhe } from "../../painel-entregas/services/painelService";
import { limparRetiradaLocal, temRetiradaLocal } from "../../../../shared/utils/retiradaLocal";

/**
 * Se a retirada da bagagem desta tentativa já foi feita (V48): pelo servidor ou, sem conexão, pela marca deste aparelho
 * (retirada salva na fila). `null` = não deu para saber; o servidor decide ao iniciar a viagem.
 */
export function useRetiradaFeita(entregaId: string): boolean | null {
  const [feita, setFeita] = useState<boolean | null>(() => (temRetiradaLocal(entregaId) ? true : null));

  useEffect(() => {
    if (!entregaId) {
      return;
    }
    let ativo = true;
    consultarDetalhe(entregaId)
      .then((detalhe) => {
        if (!ativo) {
          return;
        }
        // Entrega já em andamento (viagem iniciada antes desta versão) não precisa de retirada.
        const noServidor = detalhe.retiradaRegistrada === true || detalhe.temTrajetoIniciado;
        if (noServidor) {
          // O servidor já sabe: a marca da fila não é mais necessária.
          limparRetiradaLocal(entregaId);
        }
        // Sem confirmação do servidor, só a retirada ainda na fila deste aparelho conta.
        setFeita(noServidor || temRetiradaLocal(entregaId));
      })
      .catch(() => undefined);
    return () => {
      ativo = false;
    };
  }, [entregaId]);

  return feita;
}
