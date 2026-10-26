import { useState } from "react";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { useTextos } from "../../../shared/i18n/idioma";
import { criarMotivo, desativarMotivo, listarMotivos } from "./configuracoesTenantApi";
import { Alerta } from "../../../shared/ui/Alerta";
import { Icone } from "../../../shared/ui/Icone";
import { Painel } from "../layout/Pagina";

/**
 * Motivos de não entrega (HU11, FR-009): nunca se apaga, só se desativa - as
 * ocorrências antigas continuam apontando para o motivo. A API só lista os
 * ativos, então um motivo desativado some daqui e não há como reativá-lo.
 */
export function SecaoMotivos() {
  const t = useTextos().backOffice.configuracoes;
  const { dados, erro, recarregar } = useRecurso(listarMotivos, t.falhaMotivos);
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
    <Painel titulo={t.motivosTitulo} descricao={t.motivosDescricao}>
      {(erro || erroAcao) && <Alerta tipo="erro">{erro ?? erroAcao}</Alerta>}
      {dados && dados.length === 0 && <p className="texto-apoio">{t.nenhumMotivo}</p>}
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
            await criarMotivo(descricao.trim(), reagendamento);
            setDescricao("");
            setReagendamento(false);
          }, t.falhaCriarMotivo);
        }}
      >
        <div>
          <label htmlFor="novo-motivo" className="visualmente-oculto">
            {t.novoMotivo}
          </label>
          <input id="novo-motivo" placeholder={t.novoMotivo} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </div>
        <label className="interruptor">
          <input type="checkbox" checked={reagendamento} onChange={(e) => setReagendamento(e.target.checked)} />
          <span>{t.reagendamentoExplicacao}</span>
        </label>
        <button type="submit" disabled={!descricao.trim()}>
          <Icone nome="mais" /> {t.adicionar}
        </button>
      </form>
    </Painel>
  );
}
