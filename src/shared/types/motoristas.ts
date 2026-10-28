/** Espelha MotoristaController.MotoristaResponse; `login` é o que o motorista digita para entrar. */
export type Motorista = { id: string; nome: string; login: string; ativo: boolean; criadoEm: string };

/** Uma linha do lote (HU27); `senha` vazia pede uma senha gerada. */
export type LinhaLote = { nome: string; login: string; senha: string };

/** Espelha MotoristaController.ResultadoLinhaResponse; `senhaGerada` só vem quando o sistema gerou a senha. */
export type ResultadoLote = {
  linha: number;
  nome: string;
  login: string;
  criado: boolean;
  mensagem: string | null;
  id: string | null;
  senhaGerada: string | null;
};
