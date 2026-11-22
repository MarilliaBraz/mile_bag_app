import { requisitar } from "../../../../shared/services/httpClient";
import type { CampoObrigatorio, CategoriaCodigoNome, CodigoNome, FinalidadeMotivo, MotivoOcorrencia, PeriodicidadeAtual } from "../types";
import { caminhoApi } from "../../../../shared/services/caminhoApi";
import type { OpcaoBusca } from "../../../../shared/components/BuscaOpcoes";

const BASE = "/api/v1/configuracoes";

export const listarMotivos = (finalidade: FinalidadeMotivo) =>
  requisitar<MotivoOcorrencia[]>(BASE + caminhoApi`/motivos-ocorrencia?finalidade=${finalidade}`);
export const criarMotivo = (descricao: string, reagendamento: boolean, finalidade: FinalidadeMotivo) =>
  requisitar<MotivoOcorrencia>(`${BASE}/motivos-ocorrencia`, { metodo: "POST", corpo: { descricao, reagendamento, finalidade } });
export const desativarMotivo = (id: string) =>
  requisitar<MotivoOcorrencia>(BASE + caminhoApi`/motivos-ocorrencia/${id}`, { metodo: "PATCH", corpo: { ativo: false } });

export const listarCamposBaixa = () => requisitar<CampoObrigatorio[]>(`${BASE}/campos-baixa`);
export const salvarCamposBaixa = (campos: CampoObrigatorio[]) =>
  requisitar<CampoObrigatorio[]>(`${BASE}/campos-baixa`, { metodo: "PUT", corpo: campos });

export const listarCodigoNome = (categoria: CategoriaCodigoNome) => requisitar<CodigoNome[]>(BASE + caminhoApi`/${categoria}`);
export const criarCodigoNome = (categoria: CategoriaCodigoNome, corpo: { codigoIata: string; nome: string }) =>
  requisitar<CodigoNome>(BASE + caminhoApi`/${categoria}`, { metodo: "POST", corpo });
export const removerCodigoNome = (categoria: CategoriaCodigoNome, id: string) =>
  requisitar<void>(BASE + caminhoApi`/${categoria}/${id}`, { metodo: "DELETE" });

export const consultarPeriodicidade = () => requisitar<PeriodicidadeAtual>(`${BASE}/periodicidade-fechamento`);
export const agendarPeriodicidade = (corpo: { periodicidade: string; vigenteDesde: string }) =>
  requisitar<PeriodicidadeAtual>(`${BASE}/periodicidade-fechamento`, { metodo: "POST", corpo });

/** POST /api/v1/configuracoes/bases-aeroportuarias/{id}/principal (V52) - a base que vale quando o BDO não traz o aeroporto. */
export const tornarBasePrincipal = (id: string) =>
  requisitar<void>(BASE + caminhoApi`/bases-aeroportuarias/${id}/principal`, { metodo: "POST" });

/** V53: as opções da busca - aeroportos (pela cidade ou nome) para as bases, a lista de companhias aéreas para as companhias. */
export async function listarOpcoesBusca(categoria: CategoriaCodigoNome): Promise<OpcaoBusca[]> {
  if (categoria === "bases-aeroportuarias") {
    const aeroportos = await requisitar<{ codigo: string; nome: string; cidade: string; uf: string }[]>("/api/v1/aeroportos");
    return aeroportos.map((a) => ({ codigo: a.codigo, rotulo: `${a.cidade}/${a.uf}`, detalhe: a.nome }));
  }
  const companhias = await requisitar<{ codigoIata: string; codigoIcao: string; nome: string }[]>("/api/v1/catalogo/companhias-aereas");
  return companhias.map((c) => ({ codigo: c.codigoIata, rotulo: c.nome, detalhe: c.codigoIcao }));
}
