/**
 * Conta operacional cadastrada pelo administrador do tenant (HU23, HU33): motorista da empresa de entrega ou funcionario
 * da companhia aerea - as duas APIs devolvem o mesmo formato. `login` e o que a pessoa digita para entrar.
 */
export type Conta = {
  id: string;
  nome: string;
  login: string;
  ativo: boolean;
  criadoEm: string;
  /** V52, só motoristas: a base aeroportuária (ele vê e é avisado só dos BDOs dela). */
  baseId?: string | null;
  /** V58, só motoristas: a empresa oculta dele a tarifa paga por viagem (o relatório mostra km e pedágio). */
  ocultarTarifa?: boolean;
};

/** V52: uma base aeroportuária para escolher no cadastro do motorista. */
export type BaseOpcao = { id: string; codigoIata: string; nome: string | null };

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
  criar: (corpo: { nome: string; login: string; senha: string; baseId?: string; ocultarTarifa?: boolean }) => Promise<Conta>;
  criarEmLote: (linhas: LinhaLote[], baseId?: string) => Promise<{ criados: number; comErro: number; resultados: ResultadoLote[] }>;
  definirAtivo: (id: string, ativo: boolean) => Promise<Conta>;
  atualizar: (id: string, corpo: { nome?: string; login?: string; baseId?: string; ocultarTarifa?: boolean }) => Promise<Conta>;
  /** V58: quando true, a empresa escolhe por conta se ela vê a tarifa paga por viagem (motoristas). */
  tarifaPorConta?: boolean;
  /** V52: quando existe, a conta tem base obrigatória (motoristas). */
  listarBases?: () => Promise<BaseOpcao[]>;
  redefinirSenha: (id: string, senha: string) => Promise<void>;
};
