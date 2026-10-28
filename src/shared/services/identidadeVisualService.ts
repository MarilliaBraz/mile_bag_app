import { baixarArquivo, enviarFormulario, requisitar } from "./httpClient";
import type { IdentidadeVisual } from "../types/identidadeVisual";

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
