import type { ReactNode } from "react";

/** Ajuda contextual recolhida por padrão: fica à mão sem poluir a tela. */
export function Ajuda({ titulo = "Precisa de ajuda?", children }: { titulo?: string; children: ReactNode }) {
  return (
    <details className="ajuda">
      <summary>{titulo}</summary>
      <div>{children}</div>
    </details>
  );
}
