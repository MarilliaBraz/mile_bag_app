import { useState } from "react";
import { Alerta } from "../../../../shared/ui/Alerta";

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
    <section className="mt-4">
      <Alerta tipo="aviso">{mensagem}</Alerta>
      <label htmlFor="justificativa-divergencia">
        Justificativa da divergência{" "}
        <span className="campo-obrigatorio" aria-hidden="true">
          *
        </span>
      </label>
      <textarea
        id="justificativa-divergencia"
        aria-required="true"
        rows={3}
        value={justificativa}
        onChange={(evento) => setJustificativa(evento.target.value)}
        placeholder="Ex.: desvio por interdição da via"
      />
      <button
        type="button"
        className="grande bloco mt-3"
        onClick={() => aoReenviar(justificativa.trim())}
        disabled={justificativa.trim().length === 0 || ocupado}
      >
        {ocupado ? "Encerrando…" : "Encerrar com justificativa"}
      </button>
    </section>
  );
}
