import { useId } from "react";

/**
 * Marca do Milebag (linha de rota). Os desenhos vêm de mile_bag_documentacao/marketing/logo/final e são
 * formas vetoriais: o nome MILEBAG não depende de fonte. As cores saem de três variáveis CSS, para acompanhar o tema:
 * --marca-simbolo (traço do símbolo), --marca-destino (ponto de destino) e --marca-nome (logotipo).
 *
 * - "horizontal": ícone mala-rota + nome (barras, cabeçalhos).
 * - "vertical": linha de rota com a largura exata do nome, por cima dele (assinatura principal).
 * - "icone": só a mala-rota (espaços pequenos).
 */
type Variante = "horizontal" | "vertical" | "icone";

interface MarcaProps {
  variante?: Variante;
  /** Mostra "Logística de bagagens" abaixo do nome. */
  descritivo?: boolean;
  /** Decorativa quando o nome "Milebag" já está escrito ao lado (ex.: título da tela). */
  decorativa?: boolean;
  className?: string;
}

const NOME = "Milebag";
const DESCRITIVO = "Logística de bagagens";

function idSeguro(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, "");
}

/** Logotipo MILEBAG desenhado: altura das maiúsculas 100, hastes 10, horizontais 8, curvas 9. */
function Logotipo() {
  const base = idSeguro(useId());
  const clipM = `${base}-m`;
  const clipA = `${base}-a`;
  return (
    <svg className="marca-nome" viewBox="0 -2 624 104" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clipM}>
          <rect x="0" y="0" width="90" height="100" />
        </clipPath>
        <clipPath id={clipA}>
          <rect x="0" y="0" width="84" height="100" />
        </clipPath>
      </defs>
      <g fill="none" stroke="var(--marca-nome, currentColor)" strokeMiterlimit={20}>
        <path clipPath={`url(#${clipM})`} d="M5 100V0L45 80L85 0V100" strokeWidth={10} />
        <path d="M123 0V100" strokeWidth={10} />
        <g transform="translate(156 0)">
          <path d="M5 0V100" strokeWidth={10} />
          <path d="M5 96H58" strokeWidth={8} />
        </g>
        <g transform="translate(234 0)">
          <path d="M5 0V100" strokeWidth={10} />
          <path d="M5 4H60M5 49H55M5 96H60" strokeWidth={8} />
        </g>
        <g transform="translate(320 0)">
          <path d="M5 0V100" strokeWidth={10} />
          <path d="M5 4.5H42A22.25 22.25 0 0 1 42 49H5M5 49H46A23.25 23.25 0 0 1 46 95.5H5" strokeWidth={9} />
        </g>
        <g transform="translate(413.75 0)">
          <path clipPath={`url(#${clipA})`} d="M3.84 106L42 0L80.16 106" strokeWidth={10} />
          <path d="M20 66H64" strokeWidth={8} />
        </g>
        <g transform="translate(519.75 0)">
          <path d="M86.24 20.43A46 46 0 1 0 97 50" strokeWidth={9.5} />
          <path d="M101.75 50H58" strokeWidth={8} />
        </g>
      </g>
    </svg>
  );
}

/** Mala-rota: a rota da marca dentro da mala (origem em anel, trecho cheio, trecho final tracejado, destino). */
export function IconeMalaRota({ className = "marca-icone" }: { className?: string }) {
  const traco = "var(--marca-simbolo, currentColor)";
  return (
    <svg className={className} viewBox="10 10 100 100" aria-hidden="true" focusable="false">
      <g fill="none" stroke={traco} strokeWidth={10} strokeMiterlimit={20}>
        <rect x="15" y="32.5" width="90" height="70" rx="13" />
        <path d="M44 32.5V17.5H76V32.5" />
      </g>
      <circle cx="33" cy="82" r="5" fill="none" stroke={traco} strokeWidth={6.5} />
      <path d="M33 73.75V66H52V48.75" fill="none" stroke={traco} strokeWidth={6.5} strokeMiterlimit={10} />
      <path d="M55.25 52H77.75" fill="none" stroke={traco} strokeWidth={6.5} strokeDasharray="4.5 2.25" strokeDashoffset={4.5} />
      <circle cx="86" cy="52" r="8.25" fill="var(--marca-destino, var(--marca-simbolo, currentColor))" />
    </svg>
  );
}

/** Mala de casco rígido da marca, em caixa 100 × 100 (a espessura vem de quem usa). */
export function MalaDaMarca({ espessura }: { espessura: number }) {
  return (
    <g fill="none" stroke="var(--marca-simbolo, currentColor)" strokeWidth={espessura} strokeMiterlimit={20}>
      <rect x="5" y="25" width="90" height="70" rx="13" />
      <path d="M34 25V10H66V25" />
      <path d="M35 43V77M65 43V77" />
    </g>
  );
}

/** Linha de rota (símbolo principal): origem, trecho percorrido, mala no círculo, trecho que falta, destino. */
export function LinhaDeRota({ className = "marca-rota" }: { className?: string }) {
  const traco = "var(--marca-simbolo, currentColor)";
  return (
    <svg className={className} viewBox="0 30 240 60" aria-hidden="true" focusable="false">
      <circle cx="7.1" cy="60" r="5.5" fill="none" stroke={traco} strokeWidth={3.2} />
      <path d="M14.2 60H90.4" fill="none" stroke={traco} strokeWidth={3.2} />
      <circle cx="120" cy="60" r="28" fill="none" stroke={traco} strokeWidth={3.2} />
      <g transform="translate(102.5 41.625) scale(0.35)">
        <MalaDaMarca espessura={9.143} />
      </g>
      <path d="M151.6 60H225.8" fill="none" stroke={traco} strokeWidth={3.2} strokeDasharray="6 4.025" strokeDashoffset={6} />
      <circle cx="232.9" cy="60" r="7.1" fill="var(--marca-destino, var(--marca-simbolo, currentColor))" />
    </svg>
  );
}

export function Marca({ variante = "horizontal", descritivo = false, decorativa = false, className = "" }: MarcaProps) {
  const rotulo = decorativa ? { "aria-hidden": true as const } : { role: "img", "aria-label": NOME };
  const classeVariante = { horizontal: "marca-horizontal", vertical: "marca-vertical", icone: "marca-so-icone" }[variante];
  const classes = `marca-logo ${classeVariante}${className ? ` ${className}` : ""}`;

  if (variante === "icone") {
    return (
      <span className={classes} {...rotulo}>
        <IconeMalaRota />
      </span>
    );
  }

  const textoDescritivo = descritivo && <span className="marca-descritivo">{DESCRITIVO}</span>;

  if (variante === "vertical") {
    return (
      <span className={classes} {...rotulo}>
        <LinhaDeRota />
        <Logotipo />
        {textoDescritivo}
      </span>
    );
  }

  return (
    <span className={classes} {...rotulo}>
      <IconeMalaRota />
      <span className="marca-texto">
        <Logotipo />
        {textoDescritivo}
      </span>
    </span>
  );
}
