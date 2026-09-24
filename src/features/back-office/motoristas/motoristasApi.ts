import { requisitar } from "../../../shared/api/httpClient";

/** Espelha MotoristaController.MotoristaResponse; `login` é o que o motorista digita para entrar. */
export type Motorista = { id: string; nome: string; login: string; ativo: boolean; criadoEm: string };

export const listarMotoristas = () => requisitar<Motorista[]>("/api/v1/motoristas");
export const criarMotorista = (corpo: { nome: string; login: string; senha: string }) =>
  requisitar<Motorista>("/api/v1/motoristas", { metodo: "POST", corpo });
export const definirAtivoMotorista = (id: string, ativo: boolean) =>
  requisitar<Motorista>(`/api/v1/motoristas/${id}`, { metodo: "PATCH", corpo: { ativo } });
export const redefinirSenhaMotorista = (id: string, senha: string) =>
  requisitar<void>(`/api/v1/motoristas/${id}/senha`, { metodo: "PUT", corpo: { senha } });

/** Nome do motorista para exibição; sem cadastro (ex.: registros antigos) cai no id abreviado. */
export function nomeDoMotorista(motoristas: Motorista[] | null, id: string | null): string {
  if (!id) {
    return "—";
  }
  return motoristas?.find((m) => m.id === id)?.nome ?? id.slice(0, 8);
}
