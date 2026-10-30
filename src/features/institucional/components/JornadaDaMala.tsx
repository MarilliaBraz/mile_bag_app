import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { Icone } from "../../../shared/components/Icone";
import { useTextos } from "../../../shared/utils/i18n/idioma";
import { Revelar } from "./Revelar";

/** Paradas da jornada, na ordem da entrega; cada uma tem a tela do app em public/institucional/<id>.webp. */
const PARADAS = ["registrar", "encaminhar", "motorista", "acompanhar", "comprovante", "fechamento"] as const;

/**
 * A jornada da mala (HU38, RI25): uma linha vertical que se preenche com a rolagem, com a mala descendo por ela, e uma
 * parada por etapa do sistema com a tela real ao lado. Com movimento reduzido, a linha já aparece completa.
 */
export function JornadaDaMala() {
  const t = useTextos().institucional.jornada;
  const reduzido = useReducedMotion();
  const trilho = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trilho, offset: ["start 65%", "end 65%"] });
  const progresso = useSpring(scrollYProgress, { stiffness: 140, damping: 32, restDelta: 0.001 });
  const topoMala = useTransform(progresso, [0, 1], ["0%", "100%"]);

  return (
    <section id="jornada" className="inst-secao inst-secao-alternada" aria-labelledby="inst-jornada">
      <div className="inst-largura">
        <Revelar>
          <h2 id="inst-jornada">{t.titulo}</h2>
          <p className="inst-secao-subtitulo">{t.subtitulo}</p>
        </Revelar>
        <div className="inst-jornada" ref={trilho}>
          <div className="inst-jornada-trilho" aria-hidden="true" />
          {reduzido ? (
            <div className="inst-jornada-preenchido" aria-hidden="true" />
          ) : (
            <>
              <motion.div className="inst-jornada-preenchido" style={{ scaleY: progresso }} aria-hidden="true" />
              <motion.span className="inst-jornada-mala" style={{ top: topoMala }} aria-hidden="true">
                <Icone nome="mala" />
              </motion.span>
            </>
          )}
          <ol className="inst-jornada-lista">
            {PARADAS.map((id, indice) => {
              const parada = t.paradas[id];
              return (
                <li key={id} className="inst-parada">
                  <span className="inst-parada-marco" aria-hidden="true" />
                  <Revelar className="inst-parada-texto">
                    <span className="inst-parada-numero">{String(indice + 1).padStart(2, "0")}</span>
                    <h3>{parada.titulo}</h3>
                    <p>{parada.texto}</p>
                  </Revelar>
                  <Revelar atraso={0.1} className="inst-tela">
                    <img src={`/institucional/${id}.webp`} alt={parada.alt} width={720} height={1280} loading="lazy" decoding="async" />
                  </Revelar>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
