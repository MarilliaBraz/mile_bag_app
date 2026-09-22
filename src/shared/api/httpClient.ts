import { ApiError } from "./ApiError";
import { obterToken } from "../auth/authStorage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

type ProblemDetail = {
  detail?: string;
  title?: string;
  type?: string;
};

async function tratarResposta<T>(resposta: Response): Promise<T> {
  if (resposta.status === 204) {
    return undefined as T;
  }

  const texto = await resposta.text();
  const corpo = texto ? (JSON.parse(texto) as unknown) : undefined;

  if (!resposta.ok) {
    const problema = corpo as ProblemDetail | undefined;
    throw new ApiError(resposta.status, problema?.detail ?? resposta.statusText, problema?.type);
  }

  return corpo as T;
}

function cabecalhoAutorizacao(): HeadersInit {
  const token = obterToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** GET/DELETE/POST/PATCH com corpo JSON - nunca usado para envio de arquivos (ver {@link enviarFormulario}). */
export async function requisitar<T>(
  caminho: string,
  opcoes: { metodo?: string; corpo?: unknown } = {},
): Promise<T> {
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    method: opcoes.metodo ?? "GET",
    headers: {
      ...(opcoes.corpo !== undefined ? { "Content-Type": "application/json" } : {}),
      ...cabecalhoAutorizacao(),
    },
    body: opcoes.corpo !== undefined ? JSON.stringify(opcoes.corpo) : undefined,
  });
  return tratarResposta<T>(resposta);
}

/** multipart/form-data - usado por captura de BDO (HU01) e comprovante de entrega (HU06). */
export async function enviarFormulario<T>(caminho: string, dados: FormData): Promise<T> {
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    method: "POST",
    headers: cabecalhoAutorizacao(),
    body: dados,
  });
  return tratarResposta<T>(resposta);
}
