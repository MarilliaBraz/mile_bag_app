import { motion, useReducedMotion } from "motion/react";
import { Icone } from "../../../shared/components/Icone";
import { useTextos } from "../../../shared/utils/i18n/idioma";
import { FormularioDemonstracao } from "./FormularioDemonstracao";
import { Revelar } from "./Revelar";

/** Fim da jornada (HU38): a mala chega à porta com o selo "Entregue", ao lado do pedido de demonstração. */
export function SecaoDemonstracao() {
  const t = useTextos().institucional;
  const reduzido = useReducedMotion();

  return (
    <section id="demonstracao" className="inst-secao inst-secao-alternada" aria-labelledby="inst-demonstracao">
      <div className="inst-largura inst-demonstracao-grade">
        <div>
          <Revelar>
            <h2 id="inst-demonstracao">{t.demonstracao.titulo}</h2>
            <p className="inst-secao-subtitulo">{t.demonstracao.subtitulo}</p>
          </Revelar>
          <div className="inst-porta" aria-hidden="true">
            <span className="inst-porta-casa">
              <Icone nome="casa" />
            </span>
            <motion.span
              className="inst-entregue"
              initial={reduzido ? false : { opacity: 0, scale: 0.6, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.2 }}
            >
              <Icone nome="check" /> {t.jornada.entregue}
            </motion.span>
          </div>
        </div>
        <Revelar atraso={0.1}>
          <FormularioDemonstracao />
        </Revelar>
      </div>
    </section>
  );
}
