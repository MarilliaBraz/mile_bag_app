import type { Coordenada } from "../../../shared/components/MapaBase";
import type { JanelaReagendamento } from "../../../shared/utils/formatar";

/** Espelha AcompanhamentoResponse (contracts/acompanhamento-api.md, HU31). */
/**
 * TRANSFERIDA (V46): o motorista desta viagem passou a entrega para outro; o passageiro recebe um link novo.
 * ENCERRADO (V47): a empresa cancelou o BDO - o passageiro não é informado do cancelamento, só que o acompanhamento acabou.
 */
export type EtapaAcompanhamento = "VIAGEM_INICIADA" | "A_CAMINHO" | "CHEGADA" | "ENTREGUE" | "NAO_ENTREGUE" | "TRANSFERIDA" | "ENCERRADO";

/** Etapas que encerram o link: a posição some e a página para de atualizar. */
export const ETAPAS_ENCERRADAS: readonly EtapaAcompanhamento[] = ["ENTREGUE", "NAO_ENTREGUE", "TRANSFERIDA", "ENCERRADO"];

export type Acompanhamento = {
  empresa: { nome: string; logotipoUrl?: string };
  bdoNumero?: string;
  etapa: EtapaAcompanhamento;
  iniciadaEm: string;
  posicao?: Coordenada & { registradaEm: string };
  destino?: Coordenada;
  janelaReagendamento?: JanelaReagendamento;
  /** V65: só na etapa ENTREGUE - se o passageiro já respondeu a pesquisa de satisfação. */
  avaliada?: boolean;
};

/** V65: pesquisa de satisfação depois da entrega. */
export type Avaliacao = { nota: number; cordialidade?: number; malaEmBomEstado?: boolean; comentario?: string };
