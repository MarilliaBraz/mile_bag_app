import { requisitar } from "../../../shared/services/httpClient";
import type { Sessao } from "../types";

export const autenticar = (login: string, senha: string) =>
  requisitar<Sessao>("/api/v1/auth/login", { metodo: "POST", corpo: { login, senha } });

export const solicitarRedefinicaoSenha = (login: string) =>
  requisitar<void>("/api/v1/auth/esqueci-senha", { metodo: "POST", corpo: { login } });

export const redefinirSenha = (token: string, senha: string) =>
  requisitar<void>("/api/v1/auth/redefinir-senha", { metodo: "POST", corpo: { token, senha } });

/** Troca a senha do usuário logado; a resposta traz um token novo. */
export const trocarSenha = (senhaAtual: string, novaSenha: string) =>
  requisitar<{ token: string }>("/api/v1/auth/senha", { metodo: "POST", corpo: { senhaAtual, novaSenha } });
