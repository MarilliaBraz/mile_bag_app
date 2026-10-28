import { useCallback, useEffect, useState } from "react";
import { enviarPosicao } from "../services/posicaoService";
import { obterPosicaoAtual } from "../utils/posicaoAtual";
import { EVENTO_VIAGEM, marcarViagemEmAndamento, temViagemEmAndamento } from "../utils/viagemEmAndamento";
import { useIntervaloEmPrimeiroPlano } from "./useIntervaloEmPrimeiroPlano";

const INTERVALO_MS = 15_000;

// Fora do componente: o layout do motorista é montado de novo a cada tela, e trocar de tela não deve ler o GPS de novo.
let ultimoEnvio = 0;

/**
 * Envia a posição do motorista a cada 15 s enquanto há viagem em andamento e o app está visível (HU31, RNF11).
 * Sem conexão ou sem GPS, simplesmente não envia: posição antiga não serve ao passageiro, então nada é enfileirado.
 */
export function useCompartilharPosicao() {
  const [ativo, setAtivo] = useState(temViagemEmAndamento);

  useEffect(() => {
    const atualizar = () => setAtivo(temViagemEmAndamento());
    window.addEventListener(EVENTO_VIAGEM, atualizar);
    return () => window.removeEventListener(EVENTO_VIAGEM, atualizar);
  }, []);

  const enviar = useCallback(async () => {
    if (!navigator.onLine || Date.now() - ultimoEnvio < INTERVALO_MS - 1_000) {
      return;
    }
    ultimoEnvio = Date.now();
    const posicao = await obterPosicaoAtual();
    if (!posicao) {
      return;
    }
    try {
      const { rastreando } = await enviarPosicao(posicao);
      if (!rastreando) {
        marcarViagemEmAndamento(false);
      }
    } catch {
      // Falha de rede ou da API: tenta de novo no próximo ciclo.
    }
  }, []);

  useIntervaloEmPrimeiroPlano(enviar, INTERVALO_MS, ativo);
}
