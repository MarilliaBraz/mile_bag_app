import { requisitar } from "../../../shared/api/httpClient";

const BASE = "/api/v1/configuracoes";

/** Espelha MotivoOcorrenciaResponse - o GET só devolve os motivos ativos. */
export type MotivoOcorrencia = { id: string; descricao: string; reagendamento: boolean };

/** Espelha o enum CampoBaixa e CampoObrigatorioResponse. */
export type CampoBaixa =
  | "POD_FOTO_DOCUMENTO"
  | "POD_IDENTIFICACAO_RECEBEDOR"
  | "POD_DATA_HORA"
  | "POD_GEOLOCALIZACAO"
  | "OCORRENCIA_DESCRICAO_ADICIONAL";
export type CampoObrigatorio = { campo: CampoBaixa; obrigatorio: boolean };

/** Espelha CodigoNomeResponse (base aeroportuária e companhia aérea têm o mesmo formato). */
export type CodigoNome = { id: string; codigoIata: string; nome: string };
export type CategoriaCodigoNome = "bases-aeroportuarias" | "companhias-aereas";

/** Espelha PeriodicidadeAtualResponse. */
export type PeriodicidadeAtual = { vigente: string; proxima: string | null; proximaVigenteDesde: string | null };

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
