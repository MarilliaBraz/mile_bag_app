import { requisitar } from "./httpClient";
import type { Dispensa } from "../types/dispensa";
import type { MotivoOcorrencia } from "../types/ocorrencia";
import { caminhoApi } from "./caminhoApi";

/** GET dos motivos de dispensa da empresa (mesmo cadastro dos de ocorrência, outra finalidade - V46). */
export const listarMotivosDispensa = () => requisitar<MotivoOcorrencia[]>("/api/v1/configuracoes/motivos-ocorrencia?finalidade=DISPENSA");

/** POST /api/v1/entregas/{id}/dispensas - devolve a entrega aos outros motoristas. Exige conexão (só o servidor libera). */
export const dispensarEntrega = (entregaId: string, motivoId: string | null, complemento: string | null) =>
  requisitar<Dispensa>(caminhoApi`/api/v1/entregas/${entregaId}/dispensas`, { metodo: "POST", corpo: { motivoId, complemento } });

/** GET /api/v1/entregas/{id}/dispensas - histórico de dispensas da entrega, da mais antiga para a mais recente. */
export const listarDispensas = (entregaId: string) => requisitar<Dispensa[]>(caminhoApi`/api/v1/entregas/${entregaId}/dispensas`);
