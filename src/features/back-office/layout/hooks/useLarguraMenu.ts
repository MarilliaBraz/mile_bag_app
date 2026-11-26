import { useCallback, useState, type KeyboardEvent, type PointerEvent as EventoPonteiro } from "react";

/** Larguras do menu lateral em px (só no computador; no celular o menu é a faixa do topo). */
export const LARGURA_ICONES = 72;
export const LARGURA_MINIMA_ABERTO = 192;
export const LARGURA_PADRAO = 256;
export const LARGURA_MAXIMA = 352;
const PASSO_TECLADO = 16;
const CHAVE = "milebag:largura-menu";

function lerSalva(): number {
  try {
    const salva = Number(localStorage.getItem(CHAVE));
    return salva ? ajustar(salva) : LARGURA_PADRAO;
  } catch {
    return LARGURA_PADRAO;
  }
}

/** Abaixo da largura mínima aberta, o menu "encaixa" no modo só ícones: não existe meio-termo com texto cortado. */
export function ajustar(largura: number): number {
  if (largura < LARGURA_MINIMA_ABERTO) {
    return LARGURA_ICONES;
  }
  return Math.min(largura, LARGURA_MAXIMA);
}

/**
 * Item 6: largura do menu lateral, ajustada arrastando a alça (ou pelo teclado) e guardada no navegador. `recolher`
 * alterna entre só ícones e a última largura aberta.
 */
export function useLarguraMenu() {
  const [largura, setLargura] = useState(lerSalva);
  const [ultimaAberta, setUltimaAberta] = useState(() => (largura > LARGURA_ICONES ? largura : LARGURA_PADRAO));

  const definir = useCallback((desejada: number) => {
    const nova = ajustar(desejada);
    setLargura(nova);
    if (nova > LARGURA_ICONES) {
      setUltimaAberta(nova);
    }
    try {
      localStorage.setItem(CHAVE, String(nova));
    } catch {
      // Sem armazenamento (modo privado): vale só nesta aba.
    }
  }, []);

  const alternar = useCallback(() => definir(largura > LARGURA_ICONES ? LARGURA_ICONES : ultimaAberta), [definir, largura, ultimaAberta]);

  const aoTeclar = useCallback(
    (evento: KeyboardEvent) => {
      const acoes: Record<string, () => void> = {
        ArrowLeft: () => definir(largura === LARGURA_MINIMA_ABERTO ? LARGURA_ICONES : largura - PASSO_TECLADO),
        ArrowRight: () => definir(largura === LARGURA_ICONES ? LARGURA_MINIMA_ABERTO : largura + PASSO_TECLADO),
        Home: () => definir(LARGURA_ICONES),
        End: () => definir(LARGURA_MAXIMA),
        Enter: alternar,
        " ": alternar,
      };
      const acao = acoes[evento.key];
      if (acao) {
        evento.preventDefault();
        acao();
      }
    },
    [alternar, definir, largura],
  );

  /** Arraste com o ponteiro: a borda do menu segue o cursor (o menu começa na borda esquerda da janela). */
  const aoPressionar = useCallback(
    (evento: EventoPonteiro<HTMLElement>) => {
      if (evento.button !== 0) {
        return;
      }
      evento.preventDefault();
      const alca = evento.currentTarget;
      alca.setPointerCapture(evento.pointerId);
      document.documentElement.classList.add("arrastando-menu");
      // O pointercancel pode vir sem posição: vale a última do arraste.
      let ultimoX = evento.clientX;
      const mover = (movimento: PointerEvent) => {
        ultimoX = movimento.clientX;
        setLargura(Math.max(LARGURA_ICONES, Math.min(ultimoX, LARGURA_MAXIMA)));
      };
      const soltar = () => {
        alca.removeEventListener("pointermove", mover);
        alca.removeEventListener("pointerup", soltar);
        alca.removeEventListener("pointercancel", soltar);
        document.documentElement.classList.remove("arrastando-menu");
        definir(ultimoX);
      };
      alca.addEventListener("pointermove", mover);
      alca.addEventListener("pointerup", soltar);
      alca.addEventListener("pointercancel", soltar);
    },
    [definir],
  );

  return { largura, recolhido: largura <= LARGURA_ICONES, alternar, aoTeclar, aoPressionar };
}
