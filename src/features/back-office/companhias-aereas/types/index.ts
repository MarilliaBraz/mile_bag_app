/** Espelha CompanhiaAereaController.CompanhiaAereaResponse (HU33). */
export type CompanhiaAerea = { id: string; identificador: string; nome: string; codigoIata: string; criadoEm: string };

export type NovaCompanhia = { identificador: string; nome: string; codigoIata: string; emailAdministrador: string };

/** Espelha ParceriaEntregaService.EmpresaParceira (HU37): todas as empresas de entrega, com as parceiras marcadas. */
export type EmpresaParceira = { id: string; nome: string; identificador: string; parceira: boolean };
