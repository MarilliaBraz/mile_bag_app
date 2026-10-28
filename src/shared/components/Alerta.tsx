import type { ReactNode } from "react";
import { useTextos } from "../utils/i18n/idioma";
import { Icone, type NomeIcone } from "./Icone";

export type TipoAlerta = "info" | "sucesso" | "aviso" | "erro";

const ICONE: Record<TipoAlerta, NomeIcone> = {
  info: "info",
  sucesso: "checkCirculo",
  aviso: "alerta",
  erro: "alerta",
};

/**
 * Mensagem de feedback com ícone + cor + texto (nunca só cor). Erro é
 * anunciado na hora pelo leitor de tela (`role="alert"`); os demais tipos
 * entram como `status`, sem interromper o que está sendo lido.
 */
export function Alerta({
  tipo = "info",
  children,
  aoFechar,
  id,
  className = "",
}: {
  tipo?: TipoAlerta;
  children: ReactNode;
  aoFechar?: () => void;
  id?: string;
  className?: string;
}) {
  const t = useTextos();
  return (
    <div id={id} role={tipo === "erro" ? "alert" : "status"} className={`alerta alerta-${tipo} ${className}`.trim()}>
      <Icone nome={ICONE[tipo]} />
      <div className="alerta-conteudo">{children}</div>
      {aoFechar && (
        <button type="button" className="botao-icone" onClick={aoFechar} aria-label={t.comum.fecharAviso}>
          <Icone nome="fechar" />
        </button>
      )}
    </div>
  );
}

/** Indicador de carregamento com texto (o leitor de tela anuncia o que está sendo carregado). */
export function Carregando({ texto }: { texto?: string }) {
  const t = useTextos();
  return (
    <p role="status" className="carregando">
      <span className="giro" aria-hidden="true" />
      {texto ?? t.comum.carregando}
    </p>
  );
}

/** Estado vazio com ícone e orientação, no lugar de uma frase solta que parece erro. */
export function Vazio({ icone = "info", titulo, children }: { icone?: NomeIcone; titulo: string; children?: ReactNode }) {
  return (
    <div className="vazio">
      <Icone nome={icone} />
      <strong>{titulo}</strong>
      {children && <span>{children}</span>}
    </div>
  );
}
