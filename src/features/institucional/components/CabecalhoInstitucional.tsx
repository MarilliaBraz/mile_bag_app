import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { Link } from "react-router-dom";
import { SeletorIdioma } from "../../../shared/components/SeletorIdioma";
import { useTextos } from "../../../shared/utils/i18n/idioma";
import { Marca, MalaDaMarca } from "../../../shared/components/Marca";

/**
 * Cabeçalho fixo da página institucional (HU38, RI25): "Entrar" e "Pedir demonstração" ficam visíveis em toda a rolagem.
 * A faixa de baixo é a linha de rota da marca esticada pela página: origem (anel) à esquerda, destino (ponto) à
 * direita; o trecho percorrido vira traço cheio com a rolagem e a mala no círculo anda junto.
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
        <a href="#topo" className="inst-marca" aria-label={t.marca}>
          <Marca decorativa />
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
          <div className="inst-viagem-percurso">
            <motion.span className="inst-viagem-mala" style={{ left: posicaoMala }}>
              <MalaNoCirculoPequena />
            </motion.span>
          </div>
        </div>
      )}
    </header>
  );
}

/** A mala no círculo do símbolo, no tamanho da faixa de progresso. */
export function MalaNoCirculoPequena() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <circle cx="60" cy="60" r="52" className="inst-mala-circulo" />
      <g transform="translate(34 32.4) scale(0.52)">
        <MalaDaMarca espessura={13} />
      </g>
    </svg>
  );
}
