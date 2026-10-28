import type { Coordenada } from "../../../../shared/components/MapaBase";

/** Espelha com.marillia.milebag.business.comprovante.model.ComprovanteEntregaResponse. */
export type ComprovanteEntregaResponse = {
  id: string;
  entregaId: string;
  dataHora: string;
  entregaStatus: string;
};

export type DadosComprovante = {
  foto: File;
  identificacaoRecebedor: string;
  dataHora: string;
  posicao: Coordenada | null;
  /** Idempotência: o mesmo `idLocal` reenviado devolve o comprovante já criado, em vez de duplicar (HU06/HU08). */
  idLocal: string;
  justificativaDivergencia?: string | null;
};
