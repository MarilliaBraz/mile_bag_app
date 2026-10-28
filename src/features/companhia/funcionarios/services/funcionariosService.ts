import { requisitar } from "../../../../shared/services/httpClient";
import type { Conta, LinhaLote, ResultadoLote, ServicoContas } from "../../../../shared/types/contas";

const BASE = "/api/v1/companhia/funcionarios";

/** Funcionários da companhia aérea (HU33): mesmo contrato de /motoristas (contracts/companhias-api.md). */
export const servicoFuncionarios: ServicoContas = {
  listar: () => requisitar<Conta[]>(BASE),
  criar: (corpo) => requisitar<Conta>(BASE, { metodo: "POST", corpo }),
  criarEmLote: (linhas: LinhaLote[]) =>
    requisitar<{ criados: number; comErro: number; resultados: ResultadoLote[] }>(`${BASE}/lote`, {
      metodo: "POST",
      corpo: { funcionarios: linhas.map((l) => ({ nome: l.nome, login: l.login, senha: l.senha || null })) },
    }),
  definirAtivo: (id, ativo) => requisitar<Conta>(`${BASE}/${id}`, { metodo: "PATCH", corpo: { ativo } }),
  atualizar: (id, corpo) => requisitar<Conta>(`${BASE}/${id}`, { metodo: "PATCH", corpo }),
  redefinirSenha: (id, senha) => requisitar<void>(`${BASE}/${id}/senha`, { metodo: "PUT", corpo: { senha } }),
};
