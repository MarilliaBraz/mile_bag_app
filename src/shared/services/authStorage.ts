import type { Papel } from "../types/auth";

const CHAVE_TOKEN = "milebag.token";

export function obterToken(): string | null {
  try {
    return localStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null;
  }
}

export function definirToken(token: string): void {
  localStorage.setItem(CHAVE_TOKEN, token);
}

export function limparToken(): void {
  localStorage.removeItem(CHAVE_TOKEN);
}

/** Disparado quando a API responde que a sessão expirou (ver httpClient); o app oferece entrar de novo. */
export const EVENTO_SESSAO_EXPIRADA = "milebag:sessao-expirada";

function lerClaims(): { papel?: string; tenantId?: string; exp?: number } | null {
  const token = obterToken();
  if (!token) {
    return null;
  }
  try {
    const carga = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(carga)) as { papel?: string; tenantId?: string; exp?: number };
  } catch {
    return null;
  }
}

/**
 * Há um token guardado, mas ele já passou da validade (claim `exp`). A API
 * recusaria qualquer chamada com ele; melhor ir direto para o login do que
 * mostrar telas que só dão erro.
 */
export function tokenExpirado(): boolean {
  const exp = lerClaims()?.exp;
  return obterToken() !== null && exp !== undefined && exp * 1000 <= Date.now();
}

/**
 * Papel (claim `papel`) do token guardado. Só orienta a navegação - quem
 * autoriza de verdade é a API; um token adulterado apenas mostraria telas
 * cujas chamadas voltariam 403.
 */
export function obterPapel(): Papel | null {
  return (lerClaims()?.papel as Papel | undefined) ?? null;
}

/** Empresa do usuário logado (claim `tenantId`) - chave de dados guardados no aparelho que dependem da empresa. */
export function obterTenantId(): string | null {
  return lerClaims()?.tenantId ?? null;
}

export function rotaInicialDo(papel: Papel | null): string {
  switch (papel) {
    case "ADMINISTRADOR_TENANT":
      return "/admin";
    case "ADMINISTRADOR_PLATAFORMA":
      return "/plataforma";
    default:
      return "/motorista";
  }
}
