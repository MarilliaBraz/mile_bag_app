import { useState } from "react";

/**
 * Justificativa de divergência do trajeto (HU04, RN14/FR-008) - só aparece
 * depois que o encerramento é recusado com `422`, quando a quilometragem
 * final diverge da rota inicialmente sugerida acima do limiar. Preencher e
 * reenviar conclui o encerramento; o motorista nunca fica travado.
 */
export function JustificativaDivergencia({
  mensagem,
  aoReenviar,
  ocupado = false,
}: {
  mensagem: string;
  aoReenviar: (justificativa: string) => void;
  ocupado?: boolean;
}) {
  const [justificativa, setJustificativa] = useState("");

  return (
    <section style={{ marginTop: "1rem" }}>
      <p role="alert" style={{ color: "var(--aviso)" }}>
        {mensagem}
      </p>
      <label htmlFor="justificativa-divergencia">Justificativa da divergência *</label>
      <textarea
        id="justificativa-divergencia"
        rows={3}
        value={justificativa}
        onChange={(evento) => setJustificativa(evento.target.value)}
        placeholder="Ex.: desvio por interdição da via"
      />
      <button
        onClick={() => aoReenviar(justificativa.trim())}
        disabled={justificativa.trim().length === 0 || ocupado}
        style={{ marginTop: "0.75rem" }}
      >
        {ocupado ? "Encerrando…" : "Encerrar viagem com justificativa"}
      </button>
    </section>
  );
}
