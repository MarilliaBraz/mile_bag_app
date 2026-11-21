import { useState } from "react";
import { mensagemDeErro } from "../../../../shared/utils/formatar";
import { useRecurso } from "../../../../shared/hooks/useRecurso";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { criarMotivo, desativarMotivo, listarMotivos } from "../services/configuracoesTenantService";
import type { FinalidadeMotivo } from "../types";
import { Alerta } from "../../../../shared/components/Alerta";
import { Icone } from "../../../../shared/components/Icone";
import { Painel } from "../../../../shared/components/Pagina";

/**
 * Motivos de uma finalidade (HU11, FR-009): de não entrega (ocorrência), de
 * dispensa da entrega pelo motorista (V46) ou de cancelamento do BDO pela empresa (V47). Nunca se apaga, só se desativa - os
 * registros antigos continuam apontando para o motivo. A API só lista os
 * ativos, então um motivo desativado some daqui e não há como reativá-lo.
 * Reagendamento só existe em motivo de ocorrência.
 */
export function SecaoMotivos({ finalidade }: { finalidade: FinalidadeMotivo }) {
  const t = useTextos().backOffice.configuracoes;
  const deOcorrencia = finalidade === "OCORRENCIA";
  const textos = {
    OCORRENCIA: { titulo: t.motivosTitulo, descricao: t.motivosDescricao, nenhum: t.nenhumMotivo },
    DISPENSA: { titulo: t.motivosDispensaTitulo, descricao: t.motivosDispensaDescricao, nenhum: t.nenhumMotivoDispensa },
    CANCELAMENTO: { titulo: t.motivosCancelamentoTitulo, descricao: t.motivosCancelamentoDescricao, nenhum: t.nenhumMotivoCancelamento },
    RECEBEDOR: { titulo: t.motivosRecebedorTitulo, descricao: t.motivosRecebedorDescricao, nenhum: t.nenhumMotivoRecebedor },
    CORRECAO: { titulo: t.motivosCorrecaoTitulo, descricao: t.motivosCorrecaoDescricao, nenhum: t.nenhumMotivoCorrecao },
  }[finalidade];
  const { dados, erro, recarregar } = useRecurso(() => listarMotivos(finalidade), t.falhaMotivos);
  const [descricao, setDescricao] = useState("");
  const [reagendamento, setReagendamento] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  async function executar(acao: () => Promise<unknown>, mensagem: string) {
    setErroAcao(null);
    try {
      await acao();
      await recarregar();
    } catch (excecao) {
      setErroAcao(mensagemDeErro(excecao, mensagem));
    }
  }

  return (
    <Painel titulo={textos.titulo} descricao={textos.descricao}>
      {(erro || erroAcao) && <Alerta tipo="erro">{erro ?? erroAcao}</Alerta>}
      {dados && dados.length === 0 && <p className="texto-apoio">{textos.nenhum}</p>}
      <ul className="lista-simples">
        {dados?.map((motivo) => (
          <li key={motivo.id}>
            <span>
              {motivo.descricao}{" "}
              {motivo.reagendamento && (
                <span className="selo selo-info">
                  <Icone nome="calendario" /> {t.reagendamento}
                </span>
              )}
            </span>
            <button
              type="button"
              className="fantasma compacto"
              aria-label={t.desativarMotivoRotulo(motivo.descricao)}
              onClick={() => executar(() => desativarMotivo(motivo.id), t.falhaDesativarMotivo)}
            >
              {t.desativar}
            </button>
          </li>
        ))}
      </ul>
      <form
        className="form-linha"
        onSubmit={(evento) => {
          evento.preventDefault();
          executar(async () => {
            await criarMotivo(descricao.trim(), deOcorrencia && reagendamento, finalidade);
            setDescricao("");
            setReagendamento(false);
          }, t.falhaCriarMotivo);
        }}
      >
        <div>
          <label htmlFor={`novo-motivo-${finalidade}`} className="visualmente-oculto">
            {t.novoMotivo}
          </label>
          <input
            id={`novo-motivo-${finalidade}`}
            placeholder={t.novoMotivo}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>
        {deOcorrencia && (
          <label className="interruptor">
            <input type="checkbox" checked={reagendamento} onChange={(e) => setReagendamento(e.target.checked)} />
            <span>{t.reagendamentoExplicacao}</span>
          </label>
        )}
        <button type="submit" disabled={!descricao.trim()}>
          <Icone nome="mais" /> {t.adicionar}
        </button>
      </form>
    </Painel>
  );
}
