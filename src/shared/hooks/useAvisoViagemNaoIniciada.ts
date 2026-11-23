import { useCallback, useEffect, useState } from "react";
import type { Coordenada } from "../components/MapaBase";
import { obterPosicaoDetalhada } from "../utils/posicaoAtual";
import { lerRetiradaAguardandoViagem, marcarRetiradaAguardandoViagem } from "../utils/retiradaLocal";
import { EVENTO_VIAGEM, temViagemEmAndamento } from "../utils/viagemEmAndamento";
import { useIntervaloEmPrimeiroPlano } from "./useIntervaloEmPrimeiroPlano";

/** A cada minuto com o app visível: a pergunta é só "já saiu do aeroporto?", não precisa de mais. */
const INTERVALO_MS = 60_000;
/** Afastamento a partir do qual a viagem claramente já começou (sai do terminal e do estacionamento do aeroporto). */
const DISTANCIA_AVISO_METROS = 2_000;
/** Retirada antiga demais não avisa: a entrega provavelmente já foi resolvida de outro jeito neste aparelho. */
const VALIDADE_MS = 12 * 60 * 60 * 1000;
const RAIO_TERRA_METROS = 6_371_000;

function distanciaMetros(a: Coordenada, b: Coordenada): number {
  const rad = (graus: number) => (graus * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * RAIO_TERRA_METROS * Math.asin(Math.sqrt(h));
}

function aguardandoViagem(): boolean {
  const retirada = lerRetiradaAguardandoViagem();
  return !!retirada && !temViagemEmAndamento() && Date.now() - retirada.registradaEm < VALIDADE_MS;
}

/**
 * Retirada feita e viagem não iniciada: se o motorista se afastar mais de 2 km do local da retirada, devolve a entrega
 * para o aviso "você ainda não iniciou a viagem" (entrega GYNLA25237: o motorista seguiu para Caldas Novas sem iniciar,
 * e a corrida não foi registrada). O GPS só é lido nesse intervalo, para o aviso - nada é gravado nem enviado.
 */
export function useAvisoViagemNaoIniciada(): { entregaId: string | null; fechar: () => void } {
  const [ativo, setAtivo] = useState(aguardandoViagem);
  const [entregaId, setEntregaId] = useState<string | null>(null);
  const [fechadoPara, setFechadoPara] = useState<string | null>(null);

  useEffect(() => {
    const atualizar = () => setAtivo(aguardandoViagem());
    window.addEventListener(EVENTO_VIAGEM, atualizar);
    return () => window.removeEventListener(EVENTO_VIAGEM, atualizar);
  }, []);

  const ciclo = useCallback(async () => {
    const retirada = lerRetiradaAguardandoViagem();
    if (!retirada || !aguardandoViagem()) {
      setAtivo(false);
      setEntregaId(null);
      return;
    }
    const { posicao } = await obterPosicaoDetalhada(10_000, INTERVALO_MS);
    if (!posicao) {
      return;
    }
    if (!retirada.posicao) {
      // Retirada sem localização: a primeira posição conhecida depois dela vira o ponto de partida.
      marcarRetiradaAguardandoViagem({ ...retirada, posicao: { latitude: posicao.latitude, longitude: posicao.longitude } });
      return;
    }
    if (distanciaMetros(retirada.posicao, posicao) > DISTANCIA_AVISO_METROS) {
      setEntregaId(retirada.entregaId);
    }
  }, []);

  useIntervaloEmPrimeiroPlano(ciclo, INTERVALO_MS, ativo);

  return {
    entregaId: entregaId && entregaId !== fechadoPara ? entregaId : null,
    // Fechar esconde até a próxima retirada; o aviso volta se o motorista reabrir o app ainda longe e sem viagem.
    fechar: () => setFechadoPara(entregaId),
  };
}
