import { motion, useReducedMotion } from "motion/react";

/** Desenho do topo (HU38): o caminho tracejado do avião até a casa, com a mala percorrendo-o. Decorativo. */
export function IlustracaoAeroportoPorta() {
  const reduzido = useReducedMotion();
  const caminho = "M40 250 C 120 250, 130 120, 220 140 S 330 60, 400 60";

  return (
    <svg className="inst-ilustracao" viewBox="0 0 440 300" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="inst-brilho" x1="0" x2="1">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="1" stopColor="#ffc21a" />
        </linearGradient>
      </defs>
      <path d={caminho} fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="10" strokeLinecap="round" />
      <motion.path
        d={caminho}
        fill="none"
        stroke="url(#inst-brilho)"
        strokeWidth="5"
        strokeLinecap="round"
        initial={reduzido ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.2, ease: "easeInOut", delay: 0.3 }}
      />
      {/* avião (origem) */}
      <g transform="translate(14 222)">
        <circle cx="26" cy="28" r="30" fill="#2563eb" />
        <path d="M14 30 L40 22 L44 26 L30 32 L36 42 L32 43 L24 34 L16 36 Z" fill="#fff" />
      </g>
      {/* casa (destino) */}
      <g transform="translate(372 24)">
        <circle cx="28" cy="36" r="30" fill="#ffc21a" />
        <path d="M14 38 L28 24 L42 38 L38 38 L38 50 L18 50 L18 38 Z" fill="#2a1d00" />
      </g>
      {/* mala percorrendo o caminho */}
      {reduzido ? (
        <rect x="392" y="44" width="16" height="13" rx="3" fill="#fff" />
      ) : (
        <motion.g
          style={{ offsetPath: `path("${caminho}")`, offsetRotate: "0deg" }}
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: "100%" }}
          transition={{ duration: 2.2, ease: "easeInOut", delay: 0.3 }}
        >
          <rect x="-11" y="-14" width="22" height="18" rx="4" fill="#fff" stroke="#0b1530" strokeWidth="2" />
          <rect x="-5" y="-19" width="10" height="6" rx="2" fill="none" stroke="#fff" strokeWidth="2" />
        </motion.g>
      )}
    </svg>
  );
}
