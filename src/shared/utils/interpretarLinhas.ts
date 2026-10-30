import type { LinhaLote } from "../types/contas";

/**
 * Interpreta o texto colado: uma linha por pessoa, `nome;login;senha` (a senha é opcional). Aceita `;`, tabulação
 * (planilha) ou `,` como separador. Uma primeira linha de cabeçalho ("nome;login") é ignorada.
 */
export function interpretarLinhas(texto: string): LinhaLote[] {
  const linhas = texto
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter((linha) => linha !== "");
  const resultado: LinhaLote[] = [];
  linhas.forEach((linha, indice) => {
    const separador = linha.includes(";") ? ";" : linha.includes("\t") ? "\t" : ",";
    const [nome = "", login = "", senha = ""] = linha.split(separador).map((parte) => parte.trim());
    if (indice === 0 && nome.toLowerCase() === "nome" && login.toLowerCase() === "login") {
      return;
    }
    resultado.push({ nome, login, senha });
  });
  return resultado;
}
