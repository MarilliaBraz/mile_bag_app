/**
 * Conta operacional cadastrada pelo administrador do tenant (HU23, HU33): motorista da empresa de entrega ou funcionario
 * da companhia aerea - as duas APIs devolvem o mesmo formato. `login` e o que a pessoa digita para entrar.
 */
export type Conta = { id: string; nome: string; login: string; ativo: boolean; criadoEm: string };

/** Uma linha do lote (HU27); `senha` vazia pede uma senha gerada. */
export type LinhaLote = { nome: string; login: string; senha: string };

/** Resultado de uma linha do lote; `senhaGerada` so vem quando o sistema gerou a senha. */
export type ResultadoLote = {
  linha: number;
  nome: string;
  login: string;
  criado: boolean;
  mensagem: string | null;
  id: string | null;
  senhaGerada: string | null;
};

/** O que o cadastro de contas precisa da API de cada tipo de conta. */
export type ServicoContas = {
  listar: () => Promise<Conta[]>;
  criar: (corpo: { nome: string; login: string; senha: string }) => Promise<Conta>;
  criarEmLote: (linhas: LinhaLote[]) => Promise<{ criados: number; comErro: number; resultados: ResultadoLote[] }>;
  definirAtivo: (id: string, ativo: boolean) => Promise<Conta>;
  atualizar: (id: string, corpo: { nome?: string; login?: string }) => Promise<Conta>;
  redefinirSenha: (id: string, senha: string) => Promise<void>;
};
