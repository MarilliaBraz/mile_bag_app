import { useCallback, useEffect, useState } from "react";
import type { Coordenada } from "../components/MapaBase";
import { obterPosicaoDetalhada, type MotivoFalhaPosicao } from "../utils/posicaoAtual";

/**
 * Captura a posição do aparelho ao abrir a tela e permite tentar de novo (comprovante e retirada da bagagem). Uma falha de
 * GPS nunca apaga o que já foi preenchido: só a captura é refeita.
 */
export function usePosicaoAtual() {
  const [posicao, setPosicao] = useState<Coordenada | null>(null);
  const [capturando, setCapturando] = useState(true);
  const [motivoFalha, setMotivoFalha] = useState<MotivoFalhaPosicao | null>(null);

  const capturar = useCallback(async () => {
    setCapturando(true);
    setMotivoFalha(null);
    const resultado = await obterPosicaoDetalhada();
    setPosicao(resultado.posicao);
    setMotivoFalha(resultado.motivo);
    setCapturando(false);
  }, []);

  useEffect(() => {
    void capturar();
  }, [capturar]);

  return { posicao, capturando, motivoFalha, capturar };
}
