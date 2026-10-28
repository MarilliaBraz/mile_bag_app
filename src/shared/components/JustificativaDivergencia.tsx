import { useState } from "react";
import { useTextos } from "../utils/i18n/idioma";
import { Alerta } from "./Alerta";

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
  const t = useTextos().motorista.rota;

  return (
    <section className="mt-4">
      <Alerta tipo="aviso">{mensagem}</Alerta>
      <label htmlFor="justificativa-divergencia">
        {t.justificativaDivergencia}{" "}
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
        placeholder={t.exemploDivergencia}
      />
      <button
        type="button"
        className="grande bloco mt-3"
        onClick={() => aoReenviar(justificativa.trim())}
        disabled={justificativa.trim().length === 0 || ocupado}
      >
        {ocupado ? t.encerrando : t.encerrarComJustificativa}
      </button>
    </section>
  );
}
