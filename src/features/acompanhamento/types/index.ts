import type { Coordenada } from "../../../shared/components/MapaBase";
import type { JanelaReagendamento } from "../../../shared/utils/formatar";

/** Espelha AcompanhamentoResponse (contracts/acompanhamento-api.md, HU31). */
/** TRANSFERIDA (V46): o motorista desta viagem passou a entrega para outro; o passageiro recebe um link novo. */
export type EtapaAcompanhamento = "VIAGEM_INICIADA" | "A_CAMINHO" | "CHEGADA" | "ENTREGUE" | "NAO_ENTREGUE" | "TRANSFERIDA";

export type Acompanhamento = {
  empresa: { nome: string; logotipoUrl?: string };
  bdoNumero?: string;
  etapa: EtapaAcompanhamento;
  iniciadaEm: string;
  posicao?: Coordenada & { registradaEm: string };
  destino?: Coordenada;
  janelaReagendamento?: JanelaReagendamento;
};
