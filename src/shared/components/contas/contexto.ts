import { createContext, useContext } from "react";
import type { BaseOpcao, ServicoContas } from "../../types/contas";
import type { Textos } from "../../utils/i18n/textos/pt";

/** Os textos de motoristas e de funcionários têm o mesmo formato. */
export type TextosContas = Textos["backOffice"]["motoristas"];

/** `bases`: só quando a conta tem base (motoristas, V52); `null` enquanto carrega. */
export const ContextoContas = createContext<{ servico: ServicoContas; t: TextosContas; bases?: BaseOpcao[] | null } | null>(null);

export function useContas() {
  const contas = useContext(ContextoContas);
  if (!contas) {
    throw new Error("useContas fora de CadastroContas.");
  }
  return contas;
}
