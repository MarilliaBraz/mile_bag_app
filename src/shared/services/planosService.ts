import { requisitar } from "./httpClient";
import type { Plano, PlanoComUso, ResultadoTrocaPlano } from "../types/planos";

export const listarPlanos = () => requisitar<PlanoComUso[]>("/api/v1/plataforma/planos");
export const criarPlano = (corpo: { nome: string; limiteMotoristasAtivos: number; limiteVolumeMensalBdos: number }) =>
  requisitar<Plano>("/api/v1/plataforma/planos", { metodo: "POST", corpo });
export const removerPlano = (id: string) => requisitar<void>(`/api/v1/plataforma/planos/${id}`, { metodo: "DELETE" });
export const trocarPlanoDoTenant = (tenantId: string, planoId: string) =>
  requisitar<ResultadoTrocaPlano>(`/api/v1/plataforma/tenants/${tenantId}/plano`, { metodo: "PUT", corpo: { planoId } });
