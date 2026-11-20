import { useEffect, useState } from "react";
import { formatarDataHora } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { listarDispensas } from "../../../../shared/services/dispensaService";
import type { Dispensa } from "../../../../shared/types/dispensa";

/**
 * Dispensas anteriores desta entrega (V46): quem assume depois sabe que ela já foi devolvida, por quem e por quê.
 * Mesmo padrão de HistoricoOcorrencias: complementar, então uma falha aqui não derruba o detalhe.
 */
export function HistoricoDispensas({ entregaId }: { entregaId: string }) {
  const [dispensas, setDispensas] = useState<Dispensa[]>([]);
  const t = useTextos().motorista.dispensa;

  useEffect(() => {
    listarDispensas(entregaId)
      .then(setDispensas)
      .catch(() => undefined);
  }, [entregaId]);

  if (dispensas.length === 0) {
    return null;
  }

  return (
    <section>
      <h2>{t.historico(dispensas.length)}</h2>
      <ul className="linha-tempo cartao">
        {dispensas.map((dispensa) => (
          <li key={dispensa.id}>
            <strong>{dispensa.motivo ?? t.semMotivo}</strong>
            <div className="texto-apoio">
              {formatarDataHora(dispensa.dataHora)}
              {dispensa.motoristaNome && ` · ${t.porMotorista(dispensa.motoristaNome)}`}
              {dispensa.comBagagem && ` · ${t.comBagagem}`}
            </div>
            {dispensa.complemento && <div className="texto-apoio">{dispensa.complemento}</div>}
          </li>
        ))}
      </ul>
    </section>
  );
}
