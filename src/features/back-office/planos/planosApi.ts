import { requisitar } from "../../../shared/api/httpClient";

/** Espelha PlanoAssinaturaResponse. */
export type Plano = {
  id: string;
  nome: string;
  limiteMotoristasAtivos: number;
  limiteVolumeMensalBdos: number;
  criadoEm: string;
};

/** Espelha PlanoAssinaturaListItemResponse - só a listagem traz a contagem de empresas. */
export type PlanoComUso = { plano: Plano; tenantsAssociados: number };

/** Espelha TrocarPlanoResponse. */
export type ResultadoTrocaPlano = { planoVigente: Plano; usoExcedeuLimiteNaTroca: boolean };

export const listarPlanos = () => requisitar<PlanoComUso[]>("/api/v1/plataforma/planos");
export const criarPlano = (corpo: { nome: string; limiteMotoristasAtivos: number; limiteVolumeMensalBdos: number }) =>
  requisitar<Plano>("/api/v1/plataforma/planos", { metodo: "POST", corpo });
export const removerPlano = (id: string) => requisitar<void>(`/api/v1/plataforma/planos/${id}`, { metodo: "DELETE" });
export const trocarPlanoDoTenant = (tenantId: string, planoId: string) =>
  requisitar<ResultadoTrocaPlano>(`/api/v1/plataforma/tenants/${tenantId}/plano`, { metodo: "PUT", corpo: { planoId } });
