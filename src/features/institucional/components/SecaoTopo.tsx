import { motion, useReducedMotion } from "motion/react";
import { useTextos } from "../../../shared/utils/i18n/idioma";
import { linkWhatsApp } from "../constantes";
import { IlustracaoAeroportoPorta } from "./IlustracaoAeroportoPorta";

/** As três partes do sistema, na ordem dos textos: painel web, aplicativo do motorista e link do passageiro. */
const TIPOS_PRODUTO = ["painel", "aplicativo", "link"] as const;

/**
 * Abertura da página (HU38): o que é o Milebag em uma frase (software de gestão e logística de bagagens), as três
 * partes do sistema e os dois caminhos de contato.
 */
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
          <ul className="inst-produtos" aria-label={t.topo.produtosRotulo}>
            {t.topo.produtos.map((produto, i) => (
              <li key={produto}>
                <IconeProduto tipo={TIPOS_PRODUTO[i]} />
                <span>{produto}</span>
              </li>
            ))}
          </ul>
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

/** Ícone de linha de cada parte do sistema, no traço da marca. Decorativo: o texto ao lado já diz o mesmo. */
function IconeProduto({ tipo }: { tipo: (typeof TIPOS_PRODUTO)[number] }) {
  return (
    <svg className="inst-produto-icone" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {tipo === "painel" && (
        <>
          <rect x="2.5" y="4" width="19" height="13" rx="2" />
          <path d="M8 21h8M12 17v4M6.5 13l3.5-3.5 3 2.5 4.5-4.5" />
        </>
      )}
      {tipo === "aplicativo" && (
        <>
          <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
          <path d="M10.5 18.5h3" />
        </>
      )}
      {tipo === "link" && (
        <>
          <circle cx="6" cy="17" r="2.5" />
          <path d="M8.5 17h3a3 3 0 0 0 3-3v-1a3 3 0 0 1 3-3" strokeDasharray="2 1.6" />
          <circle cx="19" cy="9" r="2.5" className="inst-produto-destino" />
        </>
      )}
    </svg>
  );
}
