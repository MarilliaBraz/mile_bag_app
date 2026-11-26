/** Linha de tendência pequena (decorativa: o número e a comparação ao lado dizem o mesmo em texto). Dias sem valor ficam de fora. */
export function MiniGrafico({ valores, cor = "var(--acao)" }: { valores: (number | null)[]; cor?: string }) {
  const largura = 200;
  const altura = 44;
  const pontos = valores.map((valor, i) => ({ valor, x: valores.length > 1 ? (i / (valores.length - 1)) * largura : largura / 2 }));
  const comValor = pontos.filter((p): p is { valor: number; x: number } => p.valor !== null);
  if (comValor.length < 2) {
    return <svg className="mini-grafico" viewBox={`0 0 ${largura} ${altura}`} aria-hidden="true" />;
  }
  const minimo = Math.min(...comValor.map((p) => p.valor));
  const maximo = Math.max(...comValor.map((p) => p.valor));
  const faixa = maximo - minimo || 1;
  const y = (valor: number) => altura - 4 - ((valor - minimo) / faixa) * (altura - 8);
  const linha = comValor.map((p) => `${p.x.toFixed(1)},${y(p.valor).toFixed(1)}`).join(" ");
  const ultimo = comValor[comValor.length - 1];
  return (
    <svg className="mini-grafico" viewBox={`0 0 ${largura} ${altura}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline points={linha} fill="none" stroke={cor} strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={ultimo.x} cy={y(ultimo.valor)} r="3.5" fill={cor} />
    </svg>
  );
}
