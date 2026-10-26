import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useTextos } from "../i18n/idioma";

const NOME_SISTEMA = "Milebag";

/**
 * A cada mudança de tela: mantém o título da aba igual ao <h1> (WCAG 2.4.2) e,
 * ao navegar, leva o foco ao conteúdo principal para que leitores de tela
 * anunciem a nova tela e o teclado comece do topo dela (WCAG 2.4.3). Também
 * dá ao <main> o destino do link "Pular para o conteúdo".
 */
export function AcessibilidadeDeRota() {
  const { pathname } = useLocation();
  const primeira = useRef(true);
  const t = useTextos();

  useEffect(() => {
    const atualizarTitulo = () => {
      const principal = document.querySelector("main");
      if (principal && !principal.id) {
        principal.id = "principal";
        principal.tabIndex = -1;
      }
      const titulo = document.querySelector("h1")?.textContent?.trim();
      document.title = titulo && titulo !== NOME_SISTEMA ? `${titulo} | ${NOME_SISTEMA}` : NOME_SISTEMA;
    };

    // As telas carregam dados depois de montar (o <h1> pode surgir depois): observa o DOM.
    let quadro = 0;
    const observador = new MutationObserver(() => {
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(atualizarTitulo);
    });
    observador.observe(document.getElementById("root") ?? document.body, { childList: true, subtree: true, characterData: true });
    atualizarTitulo();

    if (primeira.current) {
      primeira.current = false;
    } else {
      requestAnimationFrame(() => document.querySelector<HTMLElement>("main")?.focus({ preventScroll: true }));
    }

    return () => {
      observador.disconnect();
      cancelAnimationFrame(quadro);
    };
  }, [pathname]);

  return (
    <a href="#principal" className="pular-conteudo">
      {t.comum.pularConteudo}
    </a>
  );
}
