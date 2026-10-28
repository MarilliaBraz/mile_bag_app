import { requisitar } from "../../../../shared/services/httpClient";
import type { Convite, NovoTenant, Tenant } from "../types";

export const cadastrarTenant = (corpo: NovoTenant) => requisitar<Tenant>("/api/v1/plataforma/tenants", { metodo: "POST", corpo });
export const buscarTenant = (id: string) => requisitar<Tenant>(`/api/v1/plataforma/tenants/${id}`);
export const reenviarConvite = (tenantId: string) =>
  requisitar<void>(`/api/v1/plataforma/tenants/${tenantId}/convites/reenviar`, { metodo: "POST" });

export const consultarConvite = (token: string) => requisitar<Convite>(`/api/v1/convites/${token}`);
export const ativarConvite = (token: string, senha: string) =>
  requisitar<void>(`/api/v1/convites/${token}/ativar`, { metodo: "POST", corpo: { senha } });
