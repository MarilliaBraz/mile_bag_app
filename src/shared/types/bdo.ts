import type { PendenciaContatoBdo } from "../components/AvisoContatoIncompleto";

/** Espelha com.marillia.milebag.business.bdo.model.CamposExtraidosBdo (mile_bag_api). */
export type CamposExtraidosBdo = {
  numero: string | null;
  passageiroNome: string | null;
  enderecoEntrega: string | null;
  companhiaAerea: string | null;
  telefonePassageiro: string | null;
  emailPassageiro: string | null;
  etiquetaBagagem: string | null;
};

/** Espelha com.marillia.milebag.business.bdo.model.BdoResponse. */
export type BdoResponse = {
  id: string;
  origem: "FOTO_MANUAL" | "EMAIL_AUTOMATICO";
  camposExtraidos: CamposExtraidosBdo;
  imagemOriginal: string | null;
  statusConferencia: "PENDENTE" | "CONFIRMADO";
  dataCaptura: string;
  pendenciasContato: PendenciaContatoBdo[];
};

/** Vindo do painel ("Fotos de BDO para conferir"): abre direto a conferência de uma captura já enviada. */
export type EstadoCapturaBdo = { bdoParaConferir?: BdoResponse };
