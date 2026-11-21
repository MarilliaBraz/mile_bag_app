import type { Coordenada } from "../../../../shared/components/MapaBase";

/** Espelha com.marillia.milebag.business.comprovante.model.ComprovanteEntregaResponse. */
export type ComprovanteEntregaResponse = {
  id: string;
  entregaId: string;
  dataHora: string;
  entregaStatus: string;
};

export type DadosComprovante = {
  /** Foto do BDO assinado. */
  foto: File;
  /** V48: foto da bagagem na porta, quem assinou (lista da empresa) e o nome, fotos de avaria. */
  fotoPorta: File;
  tipoRecebedorId: string;
  nomeRecebedor: string;
  avarias: File[];
  observacaoAvaria: string | null;
  /** Texto antigo ("Tipo - Nome"), ainda enviado para versões da API anteriores aos campos novos. */
  identificacaoRecebedor: string;
  dataHora: string;
  posicao: Coordenada | null;
  /** Idempotência: o mesmo `idLocal` reenviado devolve o comprovante já criado, em vez de duplicar (HU06/HU08). */
  idLocal: string;
  justificativaDivergencia?: string | null;
  /** V51: etapas que o motorista voltou e corrigiu antes de finalizar, com motivo. */
  correcoes?: CorrecaoNoFluxo[];
};

/** Espelha com.marillia.milebag.business.correcao.model.CorrecaoInformada (V51). */
export type CorrecaoNoFluxo = {
  etapa: "FOTO_PORTA" | "FOTO_BDO_ASSINADO" | "RECEBEDOR";
  motivoId: string;
  complemento: string | null;
  antes: string;
  depois: string;
  dataHora: string;
};
