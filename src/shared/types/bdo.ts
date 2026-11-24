import type { PendenciaContatoBdo } from "../components/AvisoContatoIncompleto";

/**
 * Espelha com.marillia.milebag.business.bdo.model.CamposExtraidosBdo (mile_bag_api, V49): os campos do BDO lidos do
 * telex ou digitados pela empresa. `enderecoEntrega` é a linha do logradouro; etiquetas e cores trazem uma ou mais
 * malas separadas por vírgula.
 */
export type CamposBdo = {
  numero: string | null;
  passageiroNome: string | null;
  enderecoEntrega: string | null;
  companhiaAerea: string | null;
  telefonePassageiro: string | null;
  emailPassageiro: string | null;
  etiquetaBagagem: string | null;
  tipoProcesso: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  instrucoesEntrega: string | null;
  aeroportoRetirada: string | null;
  vooChegada: string | null;
  /** AAAA-MM-DD */
  dataEntregaPrevista: string | null;
  quantidadeMalas: number | null;
  coresBagagem: string | null;
  valorInformado: string | null;
};

/** Espelha com.marillia.milebag.business.bdo.model.BdoResponse. */
export type BdoResponse = {
  id: string;
  origem: "FOTO_MANUAL" | "EMAIL_AUTOMATICO" | "COMPANHIA_AEREA" | "EMPRESA";
  campos: CamposBdo;
  dataCaptura: string;
  pendenciasContato: PendenciaContatoBdo[];
};

/**
 * Espelha com.marillia.milebag.business.bdo.model.DadosPassageiroBdo (mile_bag_api, V59): o que a empresa pode corrigir
 * num BDO já registrado. `enderecoEntrega` é só o logradouro; cidade, UF e CEP vêm separados, como na inclusão.
 */
export type DadosPassageiroBdo = Pick<
  CamposBdo,
  "passageiroNome" | "enderecoEntrega" | "cidade" | "uf" | "cep" | "telefonePassageiro" | "emailPassageiro"
>;
