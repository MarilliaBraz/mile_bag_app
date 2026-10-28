export type Papel = "MOTORISTA" | "ADMINISTRADOR_TENANT" | "ADMINISTRADOR_PLATAFORMA";

/** Para onde o login leva depois de entrar de novo, e se mostra o aviso de sessão expirada. */
export type EstadoLogin = { sessaoExpirada?: boolean; voltarPara?: string };
