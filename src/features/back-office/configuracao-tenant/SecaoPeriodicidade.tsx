import { useState } from "react";
import { formatarData, hojeIso, mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { agendarPeriodicidade, consultarPeriodicidade } from "./configuracoesTenantApi";
import { Alerta } from "../../../shared/ui/Alerta";
import { Painel } from "../layout/Pagina";

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
    <Painel titulo="Periodicidade do fechamento" descricao="A troca é agendada para uma data futura, nunca vale para trás.">
      {(erro || erroAcao) && <Alerta tipo="erro">{erro ?? erroAcao}</Alerta>}
      {dados && (
        <p>
          Vigente: <span className="selo selo-info">{ROTULO[dados.vigente] ?? dados.vigente}</span>
          {dados.proxima && (
            <>
              {" "}
              · próxima: <strong>{ROTULO[dados.proxima] ?? dados.proxima}</strong> a partir de {formatarData(dados.proximaVigenteDesde)}
            </>
          )}
        </p>
      )}
      <form onSubmit={agendar} className="form-linha">
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
    </Painel>
  );
}
