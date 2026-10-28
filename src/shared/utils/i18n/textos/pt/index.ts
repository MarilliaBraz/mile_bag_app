import { backOffice } from "./backOffice";
import { comum } from "./comum";
import { motorista } from "./motorista";

/**
 * Textos da interface em português, a referência dos outros idiomas.
 * Texto com valor variável é função: es e en recebem os mesmos parâmetros e
 * o TypeScript confere que nenhum ficou de fora.
 */
export const pt = { ...comum, motorista, backOffice };

/** Formato que todo idioma precisa ter: o mesmo de pt, com qualquer texto no lugar de cada frase. */
type Formato<T> = {
  [Chave in keyof T]: T[Chave] extends string
    ? string
    : T[Chave] extends (...args: infer Parametros) => string
      ? (...args: Parametros) => string
      : Formato<T[Chave]>;
};

export type Textos = Formato<typeof pt>;
export type TextosComuns = Formato<typeof comum>;
