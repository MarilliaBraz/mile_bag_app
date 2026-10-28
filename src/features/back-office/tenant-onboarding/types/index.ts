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
