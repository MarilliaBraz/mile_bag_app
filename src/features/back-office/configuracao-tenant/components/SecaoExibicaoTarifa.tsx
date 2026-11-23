import { useEffect, useState } from "react";
import { mensagemDeErro } from "../../../../shared/utils/formatar";
import { useRecurso } from "../../../../shared/hooks/useRecurso";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { consultarExibicaoTarifa, salvarExibicaoTarifa } from "../services/configuracoesTenantService";
import { Alerta } from "../../../../shared/components/Alerta";
import { Painel } from "../../../../shared/components/Pagina";

/** V56: se o motorista vê a tarifa paga por viagem no relatório. Oculta, ele vê só os km (ou "cidade base") e o pedágio. */
export function SecaoExibicaoTarifa() {
  const t = useTextos().backOffice.configuracoes;
  const { dados, erro } = useRecurso(consultarExibicaoTarifa, t.falhaTarifa);
  const [ocultar, setOcultar] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (dados) {
      setOcultar(dados.ocultarTarifa);
    }
  }, [dados]);

  async function salvar() {
    setErroAcao(null);
    setSalvo(false);
    setSalvando(true);
    try {
      setOcultar((await salvarExibicaoTarifa(ocultar)).ocultarTarifa);
      setSalvo(true);
    } catch (excecao) {
      setErroAcao(mensagemDeErro(excecao, t.falhaSalvarTarifa));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Painel titulo={t.tarifaTitulo} descricao={t.tarifaDescricao}>
      {(erro || erroAcao) && <Alerta tipo="erro">{erro ?? erroAcao}</Alerta>}
      {salvo && (
        <Alerta tipo="sucesso" aoFechar={() => setSalvo(false)}>
          {t.tarifaSalva}
        </Alerta>
      )}
      <label className="interruptor" style={{ marginBottom: "1rem" }}>
        <input
          type="checkbox"
          checked={ocultar}
          disabled={!dados}
          onChange={(e) => {
            setSalvo(false);
            setOcultar(e.target.checked);
          }}
        />
        {t.ocultarTarifa}
      </label>
      <button type="button" onClick={salvar} disabled={!dados || salvando}>
        {t.salvarTarifa}
      </button>
    </Painel>
  );
}
