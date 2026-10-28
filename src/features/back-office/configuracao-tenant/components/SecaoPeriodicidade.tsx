import { useState } from "react";
import { formatarData, hojeIso, mensagemDeErro } from "../../../../shared/utils/formatar";
import { useRecurso } from "../../../../shared/hooks/useRecurso";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { agendarPeriodicidade, consultarPeriodicidade } from "../services/configuracoesTenantService";
import { Alerta } from "../../../../shared/components/Alerta";
import { Painel } from "../../../../shared/components/Pagina";

/** Periodicidade do fechamento (HU11): a troca é agendada para uma data futura, nunca vale retroativamente. */
export function SecaoPeriodicidade() {
  const t = useTextos().backOffice.configuracoes;
  const ROTULO: Record<string, string> = t.periodicidades;
  const { dados, erro, recarregar } = useRecurso(consultarPeriodicidade, t.falhaPeriodicidade);
  const [vigenteDesde, setVigenteDesde] = useState(hojeIso());
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  async function agendar(evento: React.FormEvent) {
    evento.preventDefault();
    setErroAcao(null);
    try {
      await agendarPeriodicidade({ periodicidade: "QUINZENAL", vigenteDesde });
      await recarregar();
    } catch (excecao) {
      setErroAcao(mensagemDeErro(excecao, t.falhaAgendar));
    }
  }

  return (
    <Painel titulo={t.periodicidadeTitulo} descricao={t.periodicidadeDescricao}>
      {(erro || erroAcao) && <Alerta tipo="erro">{erro ?? erroAcao}</Alerta>}
      {dados && (
        <p>
          {t.vigente} <span className="selo selo-info">{ROTULO[dados.vigente] ?? dados.vigente}</span>
          {dados.proxima && (
            <>
              {" "}
              · {t.proxima} <strong>{ROTULO[dados.proxima] ?? dados.proxima}</strong> {t.aPartirDe(formatarData(dados.proximaVigenteDesde))}
            </>
          )}
        </p>
      )}
      <form onSubmit={agendar} className="form-linha">
        <div>
          <label htmlFor="periodicidade">{t.periodicidade}</label>
          <select id="periodicidade" defaultValue="QUINZENAL">
            <option value="QUINZENAL">{t.periodicidades.QUINZENAL}</option>
          </select>
        </div>
        <div>
          <label htmlFor="vigentePeriodicidade">{t.aPartirDeRotulo}</label>
          <input id="vigentePeriodicidade" type="date" value={vigenteDesde} onChange={(e) => setVigenteDesde(e.target.value)} />
        </div>
        <button type="submit" disabled={!vigenteDesde}>
          {t.agendar}
        </button>
      </form>
    </Painel>
  );
}
