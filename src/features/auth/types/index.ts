import type { Papel } from "../../../shared/types/auth";

/** Espelha AutenticacaoController.LoginResponse. */
export type Sessao = { token: string; papel: Papel };
