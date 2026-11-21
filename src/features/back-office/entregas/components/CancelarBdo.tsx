import { useState } from "react";
import { mensagemDeErro } from "../../../../shared/utils/formatar";
import { useRecurso } from "../../../../shared/hooks/useRecurso";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Alerta } from "../../../../shared/components/Alerta";
import { ConfirmarAcao } from "../../../../shared/components/ConfirmarAcao";
import { listarMotivos } from "../../configuracao-tenant/services/configuracoesTenantService";
import { cancelarBdo } from "../services/entregasService";
import type { EntregaGestao } from "../types";

const TAMANHO_MAXIMO_COMPLEMENTO = 500;

/**
 * Cancelamento do BDO pela empresa (V47): motivo obrigatório da lista de cancelamento e, antes de enviar, a
 * confirmação "tem certeza?". Quem estava com a entrega é avisado pela API; o passageiro não.
 */
export function CancelarBdo({
  linha,
  aoCancelar,
  aoFalhar,
}: {
  linha: EntregaGestao;
  aoCancelar: () => void;
  /** A entrega pode ter mudado (concluída, cancelada, assumida): quem chama atualiza a lista. */
  aoFalhar: () => void;
}) {
  const textos = useTextos();
  const t = textos.backOffice.entregas;
  const { dados: motivos, erro } = useRecurso(() => listarMotivos("CANCELAMENTO"), t.falhaMotivosCancelamento);
  const [motivoId, setMotivoId] = useState("");
  const [complemento, setComplemento] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  async function cancelar() {
    setEnviando(true);
    setErroAcao(null);
    try {
      await cancelarBdo(linha.bdoId, motivoId, complemento.trim() || null);
      setConfirmando(false);
      aoCancelar();
    } catch (excecao) {
      setConfirmando(false);
      setErroAcao(mensagemDeErro(excecao, t.falhaCancelar));
      aoFalhar();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="pilha divisor-topo" aria-labelledby="cancelar-bdo-titulo">
      <h3 id="cancelar-bdo-titulo">{t.cancelarTitulo}</h3>
      <p className="texto-apoio">{t.cancelarDescricao}</p>
      {linha.motoristaNome && <Alerta tipo="aviso">{t.cancelarAvisoMotorista(linha.motoristaNome)}</Alerta>}
      {(erro || erroAcao) && <Alerta tipo="erro">{erroAcao ?? erro}</Alerta>}
      {motivos && motivos.length === 0 && <p className="texto-apoio">{t.semMotivosCancelamento}</p>}
      {motivos && motivos.length > 0 && (
        <form
          className="pilha"
          onSubmit={(evento) => {
            evento.preventDefault();
            setConfirmando(true);
          }}
        >
          <div>
            <label htmlFor="motivo-cancelamento">{t.motivoCancelamento}</label>
            <select id="motivo-cancelamento" required value={motivoId} onChange={(evento) => setMotivoId(evento.target.value)}>
              <option value="" disabled>
                {t.escolhaMotivo}
              </option>
              {motivos.map((motivo) => (
                <option key={motivo.id} value={motivo.id}>
                  {motivo.descricao}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="complemento-cancelamento">{t.complemento}</label>
            <textarea
              id="complemento-cancelamento"
              rows={3}
              maxLength={TAMANHO_MAXIMO_COMPLEMENTO}
              value={complemento}
              onChange={(evento) => setComplemento(evento.target.value)}
            />
          </div>
          <button type="submit" className="perigo" disabled={!motivoId}>
            {t.cancelar}
          </button>
        </form>
      )}

      <ConfirmarAcao
        aberto={confirmando}
        titulo={t.confirmarTitulo(linha.bdoNumero ?? t.semNumero)}
        descricao={t.confirmarDescricao}
        rotuloConfirmar={t.confirmarCancelar}
        // "Cancelar" ao lado de "Sim, cancelar" confundiria: aqui desistir é "Voltar".
        rotuloDesistir={textos.comum.voltar}
        perigo
        ocupado={enviando}
        aoConfirmar={cancelar}
        aoCancelar={() => setConfirmando(false)}
      />
    </section>
  );
}
