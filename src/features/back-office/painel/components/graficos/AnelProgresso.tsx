/** Anel do OTD contra a meta: o arco é o percentual, a marca é a meta. O texto do anel vai no `rotulo` (leitor de tela). */
export function AnelProgresso({
  percentual,
  meta,
  texto,
  subtexto,
  rotulo,
}: {
  percentual: number | null;
  meta: number;
  texto: string;
  subtexto: string;
  rotulo: string;
}) {
  const raio = 54;
  const circunferencia = 2 * Math.PI * raio;
  const preenchido = ((percentual ?? 0) / 100) * circunferencia;
  const anguloMeta = (meta / 100) * 360 - 90;
  const radianos = (anguloMeta * Math.PI) / 180;
  const marca = {
    x1: 65 + 46 * Math.cos(radianos),
    y1: 65 + 46 * Math.sin(radianos),
    x2: 65 + 62 * Math.cos(radianos),
    y2: 65 + 62 * Math.sin(radianos),
  };
  return (
    <svg className="anel-progresso" width="130" height="130" viewBox="0 0 130 130" role="img" aria-label={rotulo}>
      <circle cx="65" cy="65" r={raio} fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="14" />
      {percentual !== null && (
        <circle
          cx="65"
          cy="65"
          r={raio}
          fill="none"
          stroke="var(--destaque)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${preenchido} ${circunferencia}`}
          transform="rotate(-90 65 65)"
        />
      )}
      <line {...marca} stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <text x="65" y="64" textAnchor="middle" fontSize="24" fontWeight="800" fill="currentColor">
        {texto}
      </text>
      <text x="65" y="84" textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity="0.8">
        {subtexto}
      </text>
    </svg>
  );
}
