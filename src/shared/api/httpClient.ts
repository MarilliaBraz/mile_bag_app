import { ApiError } from "./ApiError";
import { EVENTO_SESSAO_EXPIRADA, limparToken, obterToken } from "../auth/authStorage";
import { obterTextos } from "../i18n/idioma";

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

/**
 * Corpo de erro da API (problem+json). Quem responde nem sempre é a API: com
 * ela fora do ar, o proxy devolve 502 sem corpo ou com HTML - nesse caso não
 * há problema para ler.
 */
function lerProblema(texto: string): ProblemDetail | undefined {
  if (!texto) {
    return undefined;
  }
  try {
    return JSON.parse(texto) as ProblemDetail;
  } catch {
    return undefined;
  }
}

/** Mensagem para quando não veio `detail` - nunca o statusText cru ("Bad Gateway"). */
function mensagemPadrao(status: number): string {
  const t = obterTextos().erroServidor;
  if (status === 502 || status === 503 || status === 504) {
    return t.indisponivel;
  }
  return status >= 500 ? t.erroInterno : t.falhaAcao(status);
}

async function tratarResposta<T>(resposta: Response): Promise<T> {
  if (resposta.status === 204) {
    return undefined as T;
  }

  const texto = await resposta.text();

  if (!resposta.ok) {
    const problema = lerProblema(texto);
    avisarSeSessaoExpirou(resposta.status, problema?.type);
    throw new ApiError(resposta.status, problema?.detail ?? mensagemPadrao(resposta.status), problema?.type);
  }

  return (texto ? JSON.parse(texto) : undefined) as T;
}

function cabecalhoAutorizacao(): HeadersInit {
  const token = obterToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** GET/DELETE/POST/PATCH com corpo JSON - nunca usado para envio de arquivos (ver {@link enviarFormulario}). */
export async function requisitar<T>(caminho: string, opcoes: { metodo?: string; corpo?: unknown } = {}): Promise<T> {
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
    const detalhe = lerProblema(await resposta.text());
    avisarSeSessaoExpirou(resposta.status, detalhe?.type);
    throw new ApiError(resposta.status, detalhe?.detail ?? mensagemPadrao(resposta.status), detalhe?.type);
  }
  return resposta.blob();
}
