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

/**
 * Papel (claim `papel`) do token guardado. Só orienta a navegação - quem
 * autoriza de verdade é a API; um token adulterado apenas mostraria telas
 * cujas chamadas voltariam 403.
 */
export function obterPapel(): Papel | null {
  const token = obterToken();
  if (!token) {
    return null;
  }
  try {
    const carga = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(carga)) as { papel?: string };
    return (claims.papel as Papel | undefined) ?? null;
  } catch {
    return null;
  }
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
