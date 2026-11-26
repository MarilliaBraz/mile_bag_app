import { useState } from "react";
import { Painel } from "../../../../shared/components/Pagina";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import type { PainelGestao } from "../types";
import { formatarPercentual } from "../utils/formatarPainel";
import { GraficoOtdVolume } from "./graficos/GraficoOtdVolume";

const PERIODOS = [7, 30] as const;

/** OTD e volume dos últimos 7 ou 30 dias, com a meta; o resumo em texto vai para o leitor de tela. */
export function GraficoPainel({ gestao }: { gestao: PainelGestao }) {
  const t = useTextos().backOffice.painel;
  const [dias, setDias] = useState<(typeof PERIODOS)[number]>(30);
  const serie = gestao.serie.slice(-dias);
  const comOtd = serie.map((dia) => dia.otd).filter((otd): otd is number => otd !== null);
  const rotulo =
    comOtd.length === 0
      ? t.graficoSemDados(dias)
      : t.graficoResumo(dias, formatarPercentual(Math.min(...comOtd)), formatarPercentual(Math.max(...comOtd)), gestao.metaOtd);
  return (
    <Painel
      titulo={t.grafico}
      descricao={t.graficoLegenda}
      className="grafico-painel"
      acoes={
        <div className="segmentado" role="group" aria-label={t.grafico}>
          {PERIODOS.map((periodo) => (
            <button key={periodo} type="button" aria-pressed={dias === periodo} onClick={() => setDias(periodo)}>
              {t.periodoDias(periodo)}
            </button>
          ))}
        </div>
      }
    >
      <GraficoOtdVolume dias={serie} meta={gestao.metaOtd} rotulo={rotulo} />
    </Painel>
  );
}
