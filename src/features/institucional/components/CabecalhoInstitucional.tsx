import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { Link } from "react-router-dom";
import { Icone } from "../../../shared/components/Icone";
import { SeletorIdioma } from "../../../shared/components/SeletorIdioma";
import { useTextos } from "../../../shared/utils/i18n/idioma";

/**
 * Cabeçalho fixo da página institucional (HU38, RI25): "Entrar" e "Pedir demonstração" ficam visíveis em toda a rolagem.
 * A faixa de baixo é a viagem da mala pela página inteira: sai do avião e chega à casa no fim.
 */
export function CabecalhoInstitucional() {
  const t = useTextos().institucional;
  const reduzido = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progresso = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const posicaoMala = useTransform(progresso, [0, 1], ["0%", "100%"]);

  return (
    <header className="inst-cabecalho">
      <nav className="inst-cabecalho-barra inst-largura" aria-label={t.navegacao}>
        <a href="#topo" className="inst-marca">
          <span className="inst-marca-simbolo" aria-hidden="true">
            M
          </span>
          <span className="inst-marca-nome">{t.marca}</span>
        </a>
        <div className="inst-cabecalho-acoes">
          <div className="inst-cabecalho-idioma">
            <SeletorIdioma />
          </div>
          <Link to="/login" className="inst-botao inst-botao-contorno">
            {t.entrar}
          </Link>
          <a href="#demonstracao" className="inst-botao inst-botao-destaque">
            {t.pedirDemonstracao}
          </a>
        </div>
      </nav>
      {!reduzido && (
        <div className="inst-viagem" aria-hidden="true">
          <motion.div className="inst-viagem-trilha" style={{ scaleX: progresso }} />
          <motion.span className="inst-viagem-mala" style={{ left: posicaoMala }}>
            <Icone nome="mala" />
          </motion.span>
        </div>
      )}
    </header>
  );
}
