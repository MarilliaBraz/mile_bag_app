import { useState } from "react";
import { formatarData, hojeIso, mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { agendarPeriodicidade, consultarPeriodicidade } from "./configuracoesTenantApi";

const ROTULO: Record<string, string> = { QUINZENAL: "Quinzenal" };

/** Periodicidade do fechamento (HU11): a troca é agendada para uma data futura, nunca vale retroativamente. */
export function SecaoPeriodicidade() {
  const { dados, erro, recarregar } = useRecurso(consultarPeriodicidade, "Não foi possível carregar a periodicidade.");
  const [vigenteDesde, setVigenteDesde] = useState(hojeIso());
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  async function agendar(evento: React.FormEvent) {
    evento.preventDefault();
    setErroAcao(null);
    try {
      await agendarPeriodicidade({ periodicidade: "QUINZENAL", vigenteDesde });
      await recarregar();
    } catch (excecao) {
      setErroAcao(mensagemDeErro(excecao, "Não foi possível agendar a periodicidade."));
    }
  }

  return (
    <section aria-labelledby="titulo-periodicidade">
      <h2 id="titulo-periodicidade">Periodicidade do fechamento</h2>
      {(erro || erroAcao) && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {erro ?? erroAcao}
        </p>
      )}
      {dados && (
        <p>
          Vigente: <strong>{ROTULO[dados.vigente] ?? dados.vigente}</strong>
          {dados.proxima && (
            <>
              {" "}
              — próxima: {ROTULO[dados.proxima] ?? dados.proxima} a partir de {formatarData(dados.proximaVigenteDesde)}
            </>
          )}
        </p>
      )}
      <form onSubmit={agendar} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "end", maxWidth: 520 }}>
        <div>
          <label htmlFor="periodicidade">Periodicidade</label>
          <select id="periodicidade" defaultValue="QUINZENAL">
            <option value="QUINZENAL">Quinzenal</option>
          </select>
        </div>
        <div>
          <label htmlFor="vigentePeriodicidade">A partir de</label>
          <input id="vigentePeriodicidade" type="date" value={vigenteDesde} onChange={(e) => setVigenteDesde(e.target.value)} />
        </div>
        <button type="submit" disabled={!vigenteDesde}>
          Agendar
        </button>
      </form>
    </section>
  );
}
