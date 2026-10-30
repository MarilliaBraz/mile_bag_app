/** Espelha com.marillia.milebag.business.demonstracao.model (mile_bag_api, HU38). */
export type PerfilCliente = "EMPRESA_ENTREGA" | "COMPANHIA_AEREA";

export type PedidoDemonstracao = {
  nome: string;
  empresa: string;
  perfil: PerfilCliente;
  email: string;
  telefone?: string;
  mensagem?: string;
  consentimento: boolean;
  /** Campo-isca: invisível para pessoas, preenchido por robôs. */
  site: string;
  /** Tempo entre abrir a página e enviar. */
  preenchidoEmMs: number;
};
