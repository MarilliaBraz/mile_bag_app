/** Espelha com.marillia.milebag.business.tarifa.model.EscopoTarifa. */
export type EscopoTarifa = "PADRAO" | "MOTORISTA" | "REGIAO";

/** Espelha TarifaResponse. Valores e datas de vigência vêm do servidor como número e AAAA-MM-DD. */
export type Tarifa = {
  id: string;
  escopo: EscopoTarifa;
  motoristaId: string | null;
  regiao: string | null;
  valorFixo: number | null;
  valorPorKm: number | null;
  vigenteDesde: string;
};

export type NovaTarifa = {
  escopo: EscopoTarifa;
  motoristaId?: string;
  regiao?: string;
  valorFixo: number | null;
  valorPorKm: number | null;
  vigenteDesde: string;
};

export type AlteracaoTarifa = Pick<NovaTarifa, "valorFixo" | "valorPorKm" | "vigenteDesde">;
