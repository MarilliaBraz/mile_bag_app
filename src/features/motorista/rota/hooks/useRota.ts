import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "../../../../shared/services/ApiError";
import { obterPosicaoAtual } from "../../../../shared/utils/posicaoAtual";
import { obterTextos } from "../../../../shared/utils/i18n/idioma";
import { executarOuEnfileirar } from "../../../../shared/services/fila";
import { marcarViagemEmAndamento } from "../../../../shared/utils/viagemEmAndamento";
import { calcularRotas, selecionarRota } from "../services/rotaService";
import { consultarTrajeto, iniciarViagem } from "../services/viagemService";
import type { CalculoRotas, Coordenada, RotaAlternativa, RotaSelecionada, TrajetoDetalhado } from "../types";

function mensagemDeErro(excecao: unknown, padrao: string): string {
  return excecao instanceof ApiError ? excecao.message : padrao;
}

/**
 * Fluxo de cálculo → seleção de rota (HU03) e execução da viagem (HU04) em
 * uma única tela (SC-002 de HU03): o recálculo continua disponível durante
 * toda a viagem (RI03), não só antes de iniciá-la.
 */
export function useRota(entregaId: string) {
  const [calculo, setCalculo] = useState<CalculoRotas | null>(null);
  const [selecao, setSelecao] = useState<RotaSelecionada | null>(null);
  const [trajeto, setTrajeto] = useState<TrajetoDetalhado | null>(null);
  const [precisaDestinoManual, setPrecisaDestinoManual] = useState(false);
  /** O servidor confirmou que a entrega ainda não tem viagem (404): só então a rota pode ser escolhida sozinha. */
  const [semViagemNoServidor, setSemViagemNoServidor] = useState(false);
  /** Ação registrada na fila offline (HU08): já vale para o motorista, mas ainda não existe no servidor. */
  const [pendenteDeSincronizacao, setPendenteDeSincronizacao] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const recalcular = useCallback(
    async (destinoManual: Coordenada | null = null) => {
      setErro(null);
      setOcupado(true);
      try {
        const posicao = await obterPosicaoAtual();
        const resposta = await calcularRotas(entregaId, posicao, destinoManual);
        setCalculo(resposta);
        // Cada cálculo apaga a escolha no servidor (RotaService.calcular): a tela não pode seguir mostrando a antiga, senão
        // o "Iniciar viagem" aparece e o servidor recusa ("Nenhuma rota foi selecionada").
        setSelecao(null);
        setPrecisaDestinoManual(false);
      } catch (excecao) {
        // 422 = endereço do BDO não geocodificável e sem coordenada manual
        // (FR-006): não é um erro do motorista, é o gatilho da tela de
        // ajuste manual do destino.
        if (excecao instanceof ApiError && excecao.status === 422) {
          setPrecisaDestinoManual(true);
        } else {
          setErro(mensagemDeErro(excecao, obterTextos().motorista.rota.falhaCalcular));
        }
      } finally {
        setOcupado(false);
      }
    },
    [entregaId],
  );

  useEffect(() => {
    let ativo = true;

    // 404 aqui significa "viagem ainda não iniciada", não uma falha.
    consultarTrajeto(entregaId)
      .then((resposta) => ativo && setTrajeto(resposta))
      .catch((excecao) => {
        if (ativo && excecao instanceof ApiError && excecao.status === 404) {
          setSemViagemNoServidor(true);
        }
      });

    recalcular();
    return () => {
      ativo = false;
    };
  }, [entregaId, recalcular]);

  /** Recarrega o trajeto (ex.: depois de um marco de progresso, HU20, que entra no histórico de checkpoints). */
  const recarregarTrajeto = useCallback(async () => {
    try {
      setTrajeto(await consultarTrajeto(entregaId));
    } catch {
      // Falha de rede aqui não invalida o que já está na tela.
    }
  }, [entregaId]);

  /** As seleções devolvem se deram certo (inclusive guardadas para enviar depois), para a tela confirmar ao motorista. */
  async function selecionarSugerida(alternativa: RotaAlternativa): Promise<boolean> {
    return registrarSelecao({ tipoSelecao: "SUGERIDA", alternativaId: alternativa.id });
  }

  async function selecionarPropria(tracadoManual: Coordenada[], justificativa: string): Promise<boolean> {
    return registrarSelecao({ tipoSelecao: "PROPRIA", tracadoManual, justificativa });
  }

  async function registrarSelecao(parametros: Parameters<typeof selecionarRota>[1]): Promise<boolean> {
    setErro(null);
    setOcupado(true);
    try {
      const { enfileirado, resultado } = await executarOuEnfileirar(() => selecionarRota(entregaId, parametros), {
        tipoEvento: "ROTA_ESCOLHIDA",
        payload: {
          entregaId,
          tipoSelecao: parametros.tipoSelecao,
          alternativaId: parametros.alternativaId ?? null,
          tracadoManual: parametros.tracadoManual ?? null,
          justificativa: parametros.justificativa ?? null,
        },
      });

      if (enfileirado) {
        setPendenteDeSincronizacao(true);
        return true;
      }

      setSelecao(resultado ?? null);
      // Com a viagem em execução, a seleção vira um novo cálculo no
      // histórico do trajeto (HU03/HU04) - recarrega para refleti-lo.
      if (trajeto) {
        setTrajeto(await consultarTrajeto(entregaId));
      }
      return true;
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, obterTextos().motorista.rota.falhaRegistrar));
      return false;
    } finally {
      setOcupado(false);
    }
  }

  async function iniciar() {
    setErro(null);
    setOcupado(true);
    try {
      const posicao = await obterPosicaoAtual();
      const { enfileirado } = await executarOuEnfileirar(() => iniciarViagem(entregaId, posicao), {
        tipoEvento: "VIAGEM_INICIADA",
        payload: { entregaId, lat: posicao?.latitude ?? null, lng: posicao?.longitude ?? null },
      });

      // HU31: a partir daqui a posição é enviada para o link de acompanhamento (mesmo antes de sincronizar).
      marcarViagemEmAndamento(true, entregaId);
      if (enfileirado) {
        setPendenteDeSincronizacao(true);
        return;
      }
      setTrajeto(await consultarTrajeto(entregaId));
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, obterTextos().motorista.rota.falhaIniciar));
    } finally {
      setOcupado(false);
    }
  }

  // Antes da viagem, a rota mais rápida já fica escolhida: o "Iniciar viagem" aparece sem depender de o motorista
  // perceber que precisa tocar numa rota (GYNLA25237). Ele ainda pode trocar. Só com o 404 do servidor confirmando que
  // não há viagem - nunca troca a rota de uma viagem em andamento -, uma vez por cálculo.
  const escolhidaSozinhaPara = useRef<CalculoRotas | null>(null);
  useEffect(() => {
    if (!calculo || !semViagemNoServidor || trajeto || selecao || pendenteDeSincronizacao || calculo.alternativas.length === 0) {
      return;
    }
    if (escolhidaSozinhaPara.current === calculo) {
      return;
    }
    escolhidaSozinhaPara.current = calculo;
    const maisRapida = calculo.alternativas.reduce((melhor, alternativa) =>
      alternativa.duracaoSegundos < melhor.duracaoSegundos ? alternativa : melhor,
    );
    void registrarSelecao({ tipoSelecao: "SUGERIDA", alternativaId: maisRapida.id });
    // registrarSelecao muda a cada render; a ref acima garante uma escolha por cálculo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculo, semViagemNoServidor, trajeto, selecao, pendenteDeSincronizacao]);

  return {
    calculo,
    selecao,
    trajeto,
    precisaDestinoManual,
    pendenteDeSincronizacao,
    erro,
    ocupado,
    recalcular,
    recarregarTrajeto,
    selecionarSugerida,
    selecionarPropria,
    iniciar,
  };
}
