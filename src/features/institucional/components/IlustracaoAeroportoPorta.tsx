import { motion, useReducedMotion } from "motion/react";
import { MalaDaMarca } from "../../../shared/components/Marca";
import { useTextos } from "../../../shared/utils/i18n/idioma";

/**
 * Desenho do topo (HU38): a linha de rota da marca em tamanho grande. A origem (anel) é a esteira do aeroporto e o
 * destino (ponto cheio) é a porta do passageiro. O trecho percorrido se desenha em traço cheio por cima do tracejado,
 * com a mala no círculo andando junto, e para no meio do caminho, como no símbolo: metade feita, metade por fazer.
 * Com movimento reduzido, já aparece parada nesse ponto. Decorativo: o texto da seção já diz o mesmo.
 */
export function IlustracaoAeroportoPorta() {
  const t = useTextos().institucional.topo;
  const reduzido = useReducedMotion();
  const caminho = "M48 236 C 140 236, 150 128, 232 140 S 330 70, 396 70";
  const viagem = { duration: 1.6, ease: "easeOut" as const, delay: 0.3 };
  const meio = 0.5;

  return (
    <svg className="inst-ilustracao" viewBox="0 0 440 300" aria-hidden="true" focusable="false">
      {/* trecho que falta: tracejado */}
      <path d={caminho} className="inst-rota-falta" />
      {/* trecho percorrido: traço cheio */}
      <motion.path
        d={caminho}
        className="inst-rota-feita"
        initial={reduzido ? false : { pathLength: 0 }}
        animate={{ pathLength: meio }}
        transition={viagem}
      />
      {/* origem e destino, com o mesmo diâmetro */}
      <circle cx="48" cy="236" r="9" className="inst-rota-origem" />
      <circle cx="396" cy="70" r="12.5" className="inst-rota-destino" />
      <text x="30" y="272" className="inst-rota-rotulo">
        {t.origem}
      </text>
      <text x="414" y="40" textAnchor="end" className="inst-rota-rotulo">
        {t.destino}
      </text>
      {/* a mala no círculo, como no símbolo da marca */}
      <motion.g
        style={{ offsetPath: `path("${caminho}")`, offsetRotate: "0deg" }}
        initial={reduzido ? false : { offsetDistance: "0%" }}
        animate={{ offsetDistance: `${meio * 100}%` }}
        transition={viagem}
      >
        <MalaNoCirculo />
      </motion.g>
    </svg>
  );
}

function MalaNoCirculo() {
  return (
    <>
      <circle r="26" className="inst-rota-circulo" />
      <g transform="translate(-16.5 -17) scale(0.33)">
        <MalaDaMarca espessura={10} />
      </g>
    </>
  );
}
