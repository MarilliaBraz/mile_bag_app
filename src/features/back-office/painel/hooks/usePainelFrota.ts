import { useCallback, useState } from "react";
import { useIntervaloEmPrimeiroPlano } from "../../../../shared/hooks/useIntervaloEmPrimeiroPlano";
import { obterPainelFrota } from "../services/painelService";
import type { PainelFrota } from "../types";

/** O custo resolve a tarifa de cada viagem do mês: consulta mais pesada, então a cada 5 minutos (não a cada 30 s). */
const INTERVALO_MS = 5 * 60_000;

/** Custo, ocupação e motoristas: usados nos cartões de metas e nas tabelas da frota, com uma consulta só. */
export function usePainelFrota() {
  const [frota, setFrota] = useState<PainelFrota | null>(null);
  const [falhou, setFalhou] = useState(false);
  const atualizar = useCallback(() => {
    obterPainelFrota().then(
      (dados) => {
        setFrota(dados);
        setFalhou(false);
      },
      () => setFalhou(true),
    );
  }, []);
  useIntervaloEmPrimeiroPlano(atualizar, INTERVALO_MS);
  return { frota, falhou };
}
