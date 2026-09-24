import { baixarArquivo, enviarFormulario, requisitar } from "../../../shared/api/httpClient";

/** Espelha IdentidadeVisualTenantResponse; tudo nulo quando a empresa não configurou nada (FR-004). */
export type IdentidadeVisual = { logotipoUrl: string | null; cabecalho: string | null; atualizadoEm: string | null };

export const consultarIdentidadeVisual = () => requisitar<IdentidadeVisual>("/api/v1/identidade-visual");

export function salvarIdentidadeVisual(dados: { logotipo?: File | null; cabecalho: string }): Promise<IdentidadeVisual> {
  const formulario = new FormData();
  if (dados.logotipo) {
    formulario.append("logotipo", dados.logotipo);
  }
  formulario.append("cabecalho", dados.cabecalho);
  return enviarFormulario<IdentidadeVisual>("/api/v1/identidade-visual", formulario, "PUT");
}

export const baixarLogotipo = () => baixarArquivo("/api/v1/identidade-visual/logotipo");
