import { formatarData } from "../../../../../shared/utils/formatar";
import type { DiaOperacao } from "../../types";

const LARGURA = 600;
const ALTURA = 220;
const TOPO = 12;
const BASE = 196;
/** O eixo do OTD vai de 50% a 100%: abaixo disso a operação já está fora de qualquer meta aceitável. */
const OTD_MINIMO = 50;

/**
 * Barras de malas entregues por dia, linha do % no prazo e a meta tracejada. Dia sem entrega interrompe a linha.
 * `rotulo` resume o gráfico em texto para leitores de tela.
 */
export function GraficoOtdVolume({ dias, meta, rotulo }: { dias: DiaOperacao[]; meta: number; rotulo: string }) {
  const passo = LARGURA / Math.max(dias.length, 1);
  const maiorVolume = Math.max(1, ...dias.map((d) => d.entregues));
  const yOtd = (otd: number) => BASE - ((Math.max(otd, OTD_MINIMO) - OTD_MINIMO) / (100 - OTD_MINIMO)) * (BASE - TOPO);
  const centro = (i: number) => i * passo + passo / 2;
  // A linha só liga dias seguidos com valor.
  const trechos: string[] = [];
  let atual: string[] = [];
  dias.forEach((dia, i) => {
    if (dia.otd === null) {
      if (atual.length > 1) trechos.push(atual.join(" "));
      atual = [];
      return;
    }
    atual.push(`${centro(i).toFixed(1)},${yOtd(dia.otd).toFixed(1)}`);
  });
  if (atual.length > 1) trechos.push(atual.join(" "));
  const isolados = dias
    .map((dia, i) => ({ dia, i }))
    .filter(({ dia, i }) => dia.otd !== null && (dias[i - 1]?.otd ?? null) === null && (dias[i + 1]?.otd ?? null) === null);
  const rotulosX = [0, Math.floor((dias.length - 1) / 2), dias.length - 1].filter((i, pos, lista) => i >= 0 && lista.indexOf(i) === pos);

  return (
    <svg className="grafico-otd" viewBox={`0 0 ${LARGURA} ${ALTURA}`} role="img" aria-label={rotulo}>
      <line x1="0" x2={LARGURA} y1={yOtd(meta)} y2={yOtd(meta)} stroke="var(--texto-suave)" strokeDasharray="5 5" />
      {dias.map((dia, i) => {
        const altura = (dia.entregues / maiorVolume) * (BASE - TOPO) * 0.75;
        return (
          <rect
            key={dia.dia}
            x={i * passo + passo * 0.2}
            y={BASE - altura}
            width={passo * 0.6}
            height={altura}
            rx="3"
            fill="var(--acao-suave)"
          />
        );
      })}
      {trechos.map((pontos) => (
        <polyline key={pontos} points={pontos} fill="none" stroke="var(--acao)" strokeWidth="3" strokeLinejoin="round" />
      ))}
      {isolados.map(({ dia, i }) => (
        <circle key={dia.dia} cx={centro(i)} cy={yOtd(dia.otd as number)} r="4" fill="var(--acao)" />
      ))}
      {rotulosX.map((i) => (
        <text key={i} x={centro(i)} y={ALTURA - 4} textAnchor="middle" fontSize="12" fill="var(--texto-suave)">
          {formatarData(dias[i].dia).slice(0, 5)}
        </text>
      ))}
    </svg>
  );
}
