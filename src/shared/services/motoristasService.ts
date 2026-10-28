import { requisitar } from "./httpClient";
import { obterTextos } from "../utils/i18n/idioma";
import type { LinhaLote, Motorista, ResultadoLote } from "../types/motoristas";

export const listarMotoristas = () => requisitar<Motorista[]>("/api/v1/motoristas");
export const criarMotorista = (corpo: { nome: string; login: string; senha: string }) =>
  requisitar<Motorista>("/api/v1/motoristas", { metodo: "POST", corpo });

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
    return obterTextos().backOffice.geral.semMotorista;
  }
  return motoristas?.find((m) => m.id === id)?.nome ?? id.slice(0, 8);
}
