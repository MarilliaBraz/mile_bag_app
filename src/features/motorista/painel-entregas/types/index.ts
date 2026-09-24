/** Espelha com.marillia.milebag.business.entrega.model.EntregaStatus (mile_bag_api). */
export type EntregaStatus = "AGUARDANDO_ATRIBUICAO" | "ATRIBUIDA" | "EM_ANDAMENTO" | "ENCERRADA_COM_SUCESSO" | "REABERTA";

/** Espelha com.marillia.milebag.business.bdo.model.BdoOrigem. */
export type BdoOrigem = "FOTO_MANUAL" | "EMAIL_AUTOMATICO";

/** Espelha com.marillia.milebag.business.entrega.model.BagagemCaronaResumo. */
export type BagagemCaronaResumo = {
  id: string;
  etiquetaBagagem: string | null;
};

/** Espelha com.marillia.milebag.business.entrega.model.ItemPainelResponse. */
export type ItemPainel = {
  entregaId: string;
  status: EntregaStatus;
  bdoNumero: string | null;
  passageiroNome: string | null;
  endereco: string | null;
  etiquetaBagagem: string | null;
  bagagensCarona: BagagemCaronaResumo[];
  dataAutoatribuicao: string;
  temTrajetoIniciado: boolean;
  marcoMaisRecente: "A_CAMINHO" | "CHEGADA" | null;
};

/** Espelha com.marillia.milebag.business.entrega.model.PainelEntregasResponse. */
export type PainelEntregas = {
  contadorPendentes: number;
  entregas: ItemPainel[];
};

/** Espelha com.marillia.milebag.business.entrega.model.ItemPainelDetalheResponse. */
export type ItemPainelDetalhe = ItemPainel & {
  companhiaAerea: string | null;
  telefone: string | null;
};

/** Espelha com.marillia.milebag.business.entrega.model.ItemBdoDisponivelResponse. */
export type ItemBdoDisponivel = {
  bdoId: string;
  origem: BdoOrigem;
  bdoNumero: string | null;
  passageiroNome: string | null;
  endereco: string | null;
  etiquetaBagagem: string | null;
  dataCaptura: string;
};

/** Espelha com.marillia.milebag.business.entrega.model.BdosDisponiveisResponse. */
export type BdosDisponiveis = {
  bdos: ItemBdoDisponivel[];
};
