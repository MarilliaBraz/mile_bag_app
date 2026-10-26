import { useEffect, useRef } from "react";

/**
 * Executa `acao` a cada `intervaloMs` só enquanto o app está visível (RNF11):
 * minimizado ou com a tela apagada, nenhuma consulta periódica gasta bateria
 * ou dados. Ao voltar ao primeiro plano, executa na hora e retoma o ritmo.
 * Também executa uma vez ao montar (ou ao reativar), se estiver visível.
 */
export function useIntervaloEmPrimeiroPlano(acao: () => void, intervaloMs: number, ativo = true) {
  // A ação mais recente fica numa ref: trocar de callback não reinicia o intervalo.
  const acaoAtual = useRef(acao);
  useEffect(() => {
    acaoAtual.current = acao;
  }, [acao]);

  useEffect(() => {
    if (!ativo) {
      return;
    }
    let intervalo: ReturnType<typeof setInterval> | null = null;

    const parar = () => {
      if (intervalo !== null) {
        clearInterval(intervalo);
        intervalo = null;
      }
    };
    const iniciar = () => {
      parar();
      acaoAtual.current();
      intervalo = setInterval(() => acaoAtual.current(), intervaloMs);
    };
    const aoMudarVisibilidade = () => (document.visibilityState === "visible" ? iniciar() : parar());

    if (document.visibilityState === "visible") {
      iniciar();
    }
    document.addEventListener("visibilitychange", aoMudarVisibilidade);
    return () => {
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
      parar();
    };
  }, [intervaloMs, ativo]);
}
