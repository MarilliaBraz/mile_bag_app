import type { ReactNode } from "react";
import { useTextos } from "../utils/i18n/idioma";

/** Ajuda contextual recolhida por padrão: fica à mão sem poluir a tela. */
export function Ajuda({ titulo, children }: { titulo?: string; children: ReactNode }) {
  const t = useTextos();
  return (
    <details className="ajuda">
      <summary>{titulo ?? t.comum.precisaDeAjuda}</summary>
      <div>{children}</div>
    </details>
  );
}
