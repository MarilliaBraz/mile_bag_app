import { requisitar } from "../../../../shared/services/httpClient";
import type { CampoObrigatorio, CategoriaCodigoNome, CodigoNome, MotivoOcorrencia, PeriodicidadeAtual } from "../types";

const BASE = "/api/v1/configuracoes";

export const listarMotivos = () => requisitar<MotivoOcorrencia[]>(`${BASE}/motivos-ocorrencia`);
export const criarMotivo = (descricao: string, reagendamento: boolean) =>
  requisitar<MotivoOcorrencia>(`${BASE}/motivos-ocorrencia`, { metodo: "POST", corpo: { descricao, reagendamento } });
export const desativarMotivo = (id: string) =>
  requisitar<MotivoOcorrencia>(`${BASE}/motivos-ocorrencia/${id}`, { metodo: "PATCH", corpo: { ativo: false } });

export const listarCamposBaixa = () => requisitar<CampoObrigatorio[]>(`${BASE}/campos-baixa`);
export const salvarCamposBaixa = (campos: CampoObrigatorio[]) =>
  requisitar<CampoObrigatorio[]>(`${BASE}/campos-baixa`, { metodo: "PUT", corpo: campos });

export const listarCodigoNome = (categoria: CategoriaCodigoNome) => requisitar<CodigoNome[]>(`${BASE}/${categoria}`);
export const criarCodigoNome = (categoria: CategoriaCodigoNome, corpo: { codigoIata: string; nome: string }) =>
  requisitar<CodigoNome>(`${BASE}/${categoria}`, { metodo: "POST", corpo });
export const removerCodigoNome = (categoria: CategoriaCodigoNome, id: string) =>
  requisitar<void>(`${BASE}/${categoria}/${id}`, { metodo: "DELETE" });

export const consultarPeriodicidade = () => requisitar<PeriodicidadeAtual>(`${BASE}/periodicidade-fechamento`);
export const agendarPeriodicidade = (corpo: { periodicidade: string; vigenteDesde: string }) =>
  requisitar<PeriodicidadeAtual>(`${BASE}/periodicidade-fechamento`, { metodo: "POST", corpo });
