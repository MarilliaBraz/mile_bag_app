import { useCallback, useEffect, useState } from "react";
import { EVENTO_ALERTAS_ALTERADOS, listarAlertas } from "../../../../shared/services/emergenciaService";
import { useIntervaloEmPrimeiroPlano } from "../../../../shared/hooks/useIntervaloEmPrimeiroPlano";
import { listarEntregas } from "../../entregas/services/entregasService";
import { estaPendente } from "../../entregas/utils/prioridadeBdo";

const INTERVALO_CONSULTA_MS = 30_000;

/** Quantidades mostradas nos balões do menu; as chaves são as do `contador` de ItemMenu. */
export type Pendencias = { emergencias: number; entregas: number };

const NENHUMA: Pendencias = { emergencias: 0, entregas: 0 };

/**
 * Emergências abertas e BDOs pendentes (sem motorista além do prazo), consultados a cada 30 s com o app visível.
 * Uma consulta só alimenta a faixa de emergência e os balões. Se uma das consultas falhar, aquele número fica como
 * estava até o próximo ciclo, para não atrapalhar a tela em uso.
 */
export function usePendencias(ativo: boolean): Pendencias {
  const [pendencias, setPendencias] = useState<Pendencias>(NENHUMA);

  const consultar = useCallback(() => {
    void Promise.allSettled([listarAlertas("ABERTO"), listarEntregas("AGUARDANDO_ATRIBUICAO")]).then(([alertas, entregas]) => {
      const agora = Date.now();
      setPendencias((atual) => {
        const novas = {
          emergencias: alertas.status === "fulfilled" ? alertas.value.length : atual.emergencias,
          entregas: entregas.status === "fulfilled" ? entregas.value.filter((linha) => estaPendente(linha, agora)).length : atual.entregas,
        };
        // Mesmo objeto quando nada mudou: o menu não redesenha a cada ciclo.
        return novas.emergencias === atual.emergencias && novas.entregas === atual.entregas ? atual : novas;
      });
    });
  }, []);

  useIntervaloEmPrimeiroPlano(consultar, INTERVALO_CONSULTA_MS, ativo);

  // Alerta atendido na tela de emergências: a faixa e o balão mudam na hora, sem esperar o próximo ciclo.
  useEffect(() => {
    if (!ativo) {
      return;
    }
    window.addEventListener(EVENTO_ALERTAS_ALTERADOS, consultar);
    return () => window.removeEventListener(EVENTO_ALERTAS_ALTERADOS, consultar);
  }, [ativo, consultar]);

  return pendencias;
}
