import { motion, useReducedMotion } from "motion/react";
import { useTextos } from "../../../shared/utils/i18n/idioma";
import { linkWhatsApp } from "../constantes";
import { IlustracaoAeroportoPorta } from "./IlustracaoAeroportoPorta";

/** Abertura da página (HU38): a promessa em uma frase e os dois caminhos de contato. */
export function SecaoTopo() {
  const t = useTextos().institucional;
  const reduzido = useReducedMotion();
  const entrada = reduzido ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };

  return (
    <section id="topo" className="inst-topo">
      <div className="inst-largura inst-topo-grade">
        <motion.div {...entrada} transition={{ duration: 0.6 }}>
          <p className="inst-selo">{t.topo.selo}</p>
          <h1>{t.topo.titulo}</h1>
          <p className="inst-topo-subtitulo">{t.topo.subtitulo}</p>
          <div className="inst-topo-acoes">
            <a href="#demonstracao" className="inst-botao inst-botao-destaque inst-botao-grande">
              {t.pedirDemonstracao}
            </a>
            <a
              href={linkWhatsApp(t.mensagemWhatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="inst-botao inst-botao-whatsapp inst-botao-grande"
            >
              {t.whatsapp}
            </a>
          </div>
        </motion.div>
        <IlustracaoAeroportoPorta />
      </div>
      <p className="inst-rolar" aria-hidden="true">
        {t.topo.rolar} ↓
      </p>
    </section>
  );
}
