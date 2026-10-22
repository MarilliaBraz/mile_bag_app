import { requisitar } from "../../../shared/api/httpClient";

/** Espelha MotoristaController.MotoristaResponse; `login` é o que o motorista digita para entrar. */
export type Motorista = { id: string; nome: string; login: string; ativo: boolean; criadoEm: string };

export const listarMotoristas = () => requisitar<Motorista[]>("/api/v1/motoristas");
export const criarMotorista = (corpo: { nome: string; login: string; senha: string }) =>
  requisitar<Motorista>("/api/v1/motoristas", { metodo: "POST", corpo });
/** Uma linha do lote (HU27); `senha` vazia pede uma senha gerada. */
export type LinhaLote = { nome: string; login: string; senha: string };

/** Espelha MotoristaController.ResultadoLinhaResponse; `senhaGerada` só vem quando o sistema gerou a senha. */
export type ResultadoLote = { linha: number; nome: string; login: string; criado: boolean; mensagem: string | null; id: string | null; senhaGerada: string | null };

export const criarMotoristasEmLote = (linhas: LinhaLote[]) =>
  requisitar<{ criados: number; comErro: number; resultados: ResultadoLote[] }>("/api/v1/motoristas/lote", {
    metodo: "POST",
    corpo: { motoristas: linhas.map((l) => ({ nome: l.nome, login: l.login, senha: l.senha || null })) },
  });
export const definirAtivoMotorista = (id: string, ativo: boolean) =>
  requisitar<Motorista>(`/api/v1/motoristas/${id}`, { metodo: "PATCH", corpo: { ativo } });
/** PATCH parcial (HU23/HU26): só os campos informados mudam; trocar o login cancela pedidos de redefinição de senha pendentes. */
export const atualizarMotorista = (id: string, corpo: { nome?: string; login?: string }) =>
  requisitar<Motorista>(`/api/v1/motoristas/${id}`, { metodo: "PATCH", corpo });
export const redefinirSenhaMotorista = (id: string, senha: string) =>
  requisitar<void>(`/api/v1/motoristas/${id}/senha`, { metodo: "PUT", corpo: { senha } });

/** Nome do motorista para exibição; sem cadastro (ex.: registros antigos) cai no id abreviado. */
export function nomeDoMotorista(motoristas: Motorista[] | null, id: string | null): string {
  if (!id) {
    return "Sem motorista";
  }
  return motoristas?.find((m) => m.id === id)?.nome ?? id.slice(0, 8);
}
