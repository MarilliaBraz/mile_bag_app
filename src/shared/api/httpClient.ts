import { ApiError } from "./ApiError";
import { EVENTO_SESSAO_EXPIRADA, limparToken, obterToken } from "../auth/authStorage";

// Endereço da API vem do arquivo .env do ambiente (modelo em .env.example), nunca fixo no código.
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  throw new Error("VITE_API_BASE_URL não definida. Configure o arquivo .env do ambiente (modelo em .env.example).");
}

type ProblemDetail = {
  detail?: string;
  title?: string;
  type?: string;
};

const TIPO_SESSAO_EXPIRADA = "/sessao-expirada";

/** 401 sessao-expirada: o token não vale mais. Some com ele e avisa o app, que oferece entrar de novo. */
function avisarSeSessaoExpirou(status: number, tipo: string | undefined): void {
  if (status === 401 && tipo?.endsWith(TIPO_SESSAO_EXPIRADA)) {
    limparToken();
    window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA));
  }
}

async function tratarResposta<T>(resposta: Response): Promise<T> {
  if (resposta.status === 204) {
    return undefined as T;
  }

  const texto = await resposta.text();
  const corpo = texto ? (JSON.parse(texto) as unknown) : undefined;

  if (!resposta.ok) {
    const problema = corpo as ProblemDetail | undefined;
    avisarSeSessaoExpirou(resposta.status, problema?.type);
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

/** multipart/form-data - usado por captura de BDO (HU01), comprovante de entrega (HU06) e identidade visual (HU13, PUT). */
export async function enviarFormulario<T>(caminho: string, dados: FormData, metodo = "POST"): Promise<T> {
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    method: metodo,
    headers: cabecalhoAutorizacao(),
    body: dados,
  });
  return tratarResposta<T>(resposta);
}

/**
 * GET de um arquivo binário (PDF, imagem) que exige o cabeçalho de
 * autorização - por isso não dá para usar um link ou <img src> direto.
 */
export async function baixarArquivo(caminho: string): Promise<Blob> {
  const resposta = await fetch(`${BASE_URL}${caminho}`, { headers: cabecalhoAutorizacao() });
  if (!resposta.ok) {
    const texto = await resposta.text();
    let detalhe: ProblemDetail | undefined;
    try {
      detalhe = texto ? (JSON.parse(texto) as ProblemDetail) : undefined;
    } catch {
      detalhe = undefined;
    }
    avisarSeSessaoExpirou(resposta.status, detalhe?.type);
    throw new ApiError(resposta.status, detalhe?.detail ?? resposta.statusText, detalhe?.type);
  }
  return resposta.blob();
}
