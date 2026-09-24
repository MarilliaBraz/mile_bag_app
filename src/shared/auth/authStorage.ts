const CHAVE_TOKEN = "milebag.token";

export type Papel = "MOTORISTA" | "ADMINISTRADOR_TENANT" | "ADMINISTRADOR_PLATAFORMA";

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

function lerClaims(): { papel?: string; tenantId?: string } | null {
  const token = obterToken();
  if (!token) {
    return null;
  }
  try {
    const carga = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(carga)) as { papel?: string; tenantId?: string };
  } catch {
    return null;
  }
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
