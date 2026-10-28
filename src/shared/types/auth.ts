export type Papel =
  | "MOTORISTA"
  | "ADMINISTRADOR_TENANT"
  | "ADMINISTRADOR_PLATAFORMA"
  // HU33: perfis da companhia aérea.
  | "ADMINISTRADOR_COMPANHIA"
  | "FUNCIONARIO_COMPANHIA";

/** Para onde o login leva depois de entrar de novo, e se mostra o aviso de sessão expirada. */
export type EstadoLogin = { sessaoExpirada?: boolean; voltarPara?: string };
