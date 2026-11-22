import { useCallback, useEffect, useState } from "react";
import { enviarPosicao } from "../services/posicaoService";
import { enviarCaminhoPendente, gravarPontoDoCaminho } from "../services/caminhoViagem";
import { contarPendentes } from "../services/fila";
import { obterPosicaoDetalhada } from "../utils/posicaoAtual";
import { EVENTO_VIAGEM, entregaEmViagem, marcarViagemEmAndamento, temViagemEmAndamento } from "../utils/viagemEmAndamento";
import { useIntervaloEmPrimeiroPlano } from "./useIntervaloEmPrimeiroPlano";

const INTERVALO_MS = 15_000;

// Fora do componente: o layout do motorista é montado de novo a cada tela, e trocar de tela não deve ler o GPS de novo.
let ultimaLeitura = 0;

/**
 * Durante a viagem, a cada 15 s com o app visível (HU31, RNF11): lê o GPS, grava o ponto no caminho da viagem (item 9,
 * também sem internet) e, com internet, envia a posição ao link de acompanhamento e os pontos guardados.
 * O link só quer a posição de agora: sem internet ela não é enfileirada; o caminho, sim.
 */
export function useCompartilharPosicao() {
  const [ativo, setAtivo] = useState(temViagemEmAndamento);

  useEffect(() => {
    const atualizar = () => setAtivo(temViagemEmAndamento());
    // A internet voltou (ou a viagem terminou): manda o caminho guardado sem esperar o próximo ciclo.
    const enviarGuardado = () => void enviarCaminhoPendente(true);
    window.addEventListener(EVENTO_VIAGEM, atualizar);
    window.addEventListener("online", enviarGuardado);
    enviarGuardado();
    return () => {
      window.removeEventListener(EVENTO_VIAGEM, atualizar);
      window.removeEventListener("online", enviarGuardado);
    };
  }, []);

  const ciclo = useCallback(async () => {
    if (Date.now() - ultimaLeitura < INTERVALO_MS - 1_000) {
      return;
    }
    ultimaLeitura = Date.now();
    // Posição em cache só se for mais nova que o intervalo: senão o passageiro veria o motorista parado.
    const { posicao } = await obterPosicaoDetalhada(10_000, INTERVALO_MS);
    const entregaId = entregaEmViagem();
    if (posicao && entregaId) {
      await gravarPontoDoCaminho(entregaId, posicao);
    }
    if (!navigator.onLine) {
      return;
    }
    void enviarCaminhoPendente();
    if (!posicao) {
      return;
    }
    try {
      const { rastreando } = await enviarPosicao({ latitude: posicao.latitude, longitude: posicao.longitude });
      // Viagem iniciada sem internet ainda na fila: o servidor não a conhece, mas ela existe - segue gravando.
      if (!rastreando && (await contarPendentes()) === 0) {
        marcarViagemEmAndamento(false);
      }
    } catch {
      // Falha de rede ou da API: tenta de novo no próximo ciclo.
    }
  }, []);

  useIntervaloEmPrimeiroPlano(ciclo, INTERVALO_MS, ativo);
}
