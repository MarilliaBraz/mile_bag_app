import { useEffect, useState } from "react";
import { ROTULO_CAMPO } from "./AjusteForm";
import { listarAjustes, type Ajuste } from "./relatorioService";

/**
 * Histórico completo de correções de uma viagem (HU17, FR-005) - nada é
 * sobrescrito, então o valor original de cada campo continua visível: é o
 * `valorAnterior` da correção mais antiga daquele campo.
 */
export function HistoricoAjustes({ viagemId }: { viagemId: string }) {
  const [ajustes, setAjustes] = useState<Ajuste[] | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    listarAjustes(viagemId)
      .then(setAjustes)
      .catch(() => setErro(true));
  }, [viagemId]);

  if (erro) {
    return (
      <p role="alert" style={{ color: "var(--erro)" }}>
        Não foi possível carregar o histórico.
      </p>
    );
  }
  if (!ajustes) {
    return <p role="status">Carregando histórico…</p>;
  }

  // A lista vem da mais recente para a mais antiga: o último de cada campo
  // (o mais antigo) é o que traz o valor original.
  const originalPorCampo = new Map<string, string>();
  for (const ajuste of ajustes) {
    originalPorCampo.set(ajuste.campo, ajuste.valorAnterior);
  }

  return (
    <div className="nao-imprimir" style={{ margin: "0.5rem 0 1rem", fontSize: "0.9rem" }}>
      <strong>Valor original preservado</strong>
      <ul>
        {[...originalPorCampo].map(([campo, original]) => (
          <li key={campo}>
            {ROTULO_CAMPO[campo as keyof typeof ROTULO_CAMPO]}: {original}
          </li>
        ))}
      </ul>
      <strong>Correções ({ajustes.length})</strong>
      <ul>
        {ajustes.map((ajuste) => (
          <li key={ajuste.id}>
            {new Date(ajuste.criadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })} — {ROTULO_CAMPO[ajuste.campo]}:{" "}
            {ajuste.valorAnterior} → <strong>{ajuste.valorNovo}</strong>
            <br />
            <em>{ajuste.justificativa}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}
