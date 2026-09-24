import { requisitar } from "../../../shared/api/httpClient";

/** Espelha TenantResponse. */
export type Tenant = {
  id: string;
  identificadorEmpresa: string;
  nome: string;
  planoId: string;
  status: string;
  criadoEm: string;
};

/** Espelha CadastroTenantRequest (o convite do 1º administrador sai na mesma operação, HU15). */
export type NovoTenant = { identificadorEmpresa: string; nome: string; planoId: string; emailAdministrador: string };

/** Espelha ConviteConsultaResponse; `status` é PENDENTE, USADO, EXPIRADO ou INVALIDADO. */
export type Convite = { tenantNome: string; emailDestinatario: string; status: string };

export const cadastrarTenant = (corpo: NovoTenant) => requisitar<Tenant>("/api/v1/plataforma/tenants", { metodo: "POST", corpo });
export const buscarTenant = (id: string) => requisitar<Tenant>(`/api/v1/plataforma/tenants/${id}`);
export const reenviarConvite = (tenantId: string) =>
  requisitar<void>(`/api/v1/plataforma/tenants/${tenantId}/convites/reenviar`, { metodo: "POST" });

export const consultarConvite = (token: string) => requisitar<Convite>(`/api/v1/convites/${token}`);
export const ativarConvite = (token: string, senha: string) =>
  requisitar<void>(`/api/v1/convites/${token}/ativar`, { metodo: "POST", corpo: { senha } });
