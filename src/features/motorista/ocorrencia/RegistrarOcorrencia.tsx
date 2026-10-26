import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../../../shared/api/ApiError";
import { executarOuEnfileirar } from "../offline-sync/fila";
import { TelaMotorista } from "../layout/TelaMotorista";
import { Ajuda } from "../../../shared/ui/Ajuda";
import { Alerta, Carregando } from "../../../shared/ui/Alerta";
import { ConfirmarAcao } from "../../../shared/ui/ConfirmarAcao";
import { formatarJanela } from "../../../shared/format/formatar";
import { listarMotivosComOrigem, registrarOcorrencia, type MotivoOcorrencia } from "./ocorrenciaService";

/** Junta data e hora digitadas (fuso do aparelho) num instante ISO; nulo enquanto falta algum dos dois. */
function instante(data: string, hora: string): string | null {
  return data && hora ? new Date(`${data}T${hora}:00`).toISOString() : null;
}

/**
 * Registro de ocorrência de não entrega (HU07) - o motorista escolhe um dos
 * motivos configurados pelo administrador do tenant (HU11) e, ao confirmar,
 * a entrega volta para `REABERTA`, disponível para nova tentativa, sem
 * perder o histórico nem os vínculos de bagagem carona (HU05, FR-005).
 *
 * <p>Motivo de reagendamento (HU29) pede a data e a faixa de horário
 * combinadas com o passageiro, que acompanham a entrega reaberta.</p>
 */
export function RegistrarOcorrencia() {
  const { entregaId } = useParams<{ entregaId: string }>();
  const navegar = useNavigate();

  const [motivos, setMotivos] = useState<MotivoOcorrencia[] | null>(null);
  const [motivosDoCache, setMotivosDoCache] = useState(false);
  const [motivoOcorrenciaId, setMotivoOcorrenciaId] = useState("");
  const [descricaoAdicional, setDescricaoAdicional] = useState("");
  const [dataReagendada, setDataReagendada] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [idLocal] = useState(() => crypto.randomUUID());
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    listarMotivosComOrigem()
      .then((resposta) => {
        setMotivos(resposta.motivos);
        setMotivosDoCache(resposta.doCache);
      })
      .catch((excecao) => {
        setErro(excecao instanceof ApiError ? excecao.message : "Não foi possível carregar os motivos de ocorrência.");
        setMotivos([]);
      });
  }, []);

  const exigeJanela = motivos?.find((motivo) => motivo.id === motivoOcorrenciaId)?.reagendamento === true;
  const janelaInicio = exigeJanela ? instante(dataReagendada, horaInicio) : null;
  const janelaFim = exigeJanela ? instante(dataReagendada, horaFim) : null;
  // A API só confere fim > início: o "ainda não passou" fica aqui, porque um registro offline pode sincronizar depois da janela.
  const erroJanela =
    janelaInicio && janelaFim
      ? new Date(janelaFim) <= new Date(janelaInicio)
        ? "O horário de fim deve ser depois do horário de início."
        : new Date(janelaFim) <= new Date()
          ? "Essa faixa de horário já passou. Confira a data combinada."
          : null
      : null;
  const janelaPronta = !exigeJanela || (janelaInicio !== null && janelaFim !== null && erroJanela === null);

  async function enviar() {
    if (!entregaId || !motivoOcorrenciaId || !janelaPronta) {
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      // Offline (HU08, FR-001): a ocorrência é registrada na fila com os
      // motivos já sincronizados e volta ao painel do mesmo jeito.
      const { enfileirado } = await executarOuEnfileirar(
        () =>
          registrarOcorrencia(entregaId, {
            motivoOcorrenciaId,
            descricaoAdicional: descricaoAdicional.trim() || null,
            idLocal,
            janelaInicio,
            janelaFim,
          }),
        {
          tipoEvento: "OCORRENCIA_REGISTRADA",
          payload: { entregaId, motivoOcorrenciaId, descricaoAdicional: descricaoAdicional.trim() || null, janelaInicio, janelaFim },
        },
      );
      navegar("/motorista", {
        state: {
          aviso: enfileirado
            ? "Ocorrência salva neste aparelho. Ela será enviada assim que houver conexão."
            : exigeJanela
              ? "Reagendamento registrado. A entrega voltou para a lista de disponíveis com o horário combinado."
              : "Ocorrência registrada. A entrega voltou para a lista de disponíveis, para nova tentativa.",
        },
      });
    } catch (excecao) {
      setConfirmando(false);
      setErro(excecao instanceof ApiError ? excecao.message : "Não foi possível registrar a ocorrência.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <TelaMotorista titulo="Não consegui entregar" voltarPara={`/motorista/entregas/${entregaId}`} rotuloVoltar="Voltar para a entrega">
      <p className="texto-apoio">A entrega volta para a lista de disponíveis, para uma nova tentativa (sua ou de outro motorista), sem perder o histórico.</p>

      {erro && <Alerta tipo="erro">{erro}</Alerta>}

      {!motivos && <Carregando texto="Carregando motivos…" />}

      {motivos && motivos.length === 0 && !erro && (
        <Alerta tipo="aviso">Nenhum motivo de ocorrência está configurado para a sua empresa. Fale com o administrador antes de continuar.</Alerta>
      )}

      {motivos && motivos.length > 0 && (
        <>
          {motivosDoCache && (
            <Alerta tipo="aviso">
              Sem conexão: usando a lista de motivos salva neste aparelho. Se o administrador mudou os motivos, o registro pode ser recusado ao sincronizar.
            </Alerta>
          )}

          <fieldset className="escolhas mt-5">
            <legend>
              O que aconteceu? <span className="campo-obrigatorio" aria-hidden="true">*</span>
            </legend>
            {motivos.map((motivo) => (
              <label key={motivo.id} className="escolha">
                <input
                  type="radio"
                  name="motivo"
                  value={motivo.id}
                  required
                  checked={motivoOcorrenciaId === motivo.id}
                  onChange={(evento) => setMotivoOcorrenciaId(evento.target.value)}
                />
                <span>{motivo.descricao}</span>
              </label>
            ))}
          </fieldset>

          {exigeJanela && (
            <fieldset className="cartao formulario mt-5">
              <legend>
                Quando o passageiro pode receber? <span className="campo-obrigatorio" aria-hidden="true">*</span>
              </legend>
              <div className="campo">
                <label htmlFor="data-reagendada">Data combinada</label>
                {/* min: o calendário já não oferece dias passados (a validação abaixo continua cobrindo o horário). */}
                <input
                  id="data-reagendada"
                  type="date"
                  required
                  min={new Date().toLocaleDateString("sv-SE")}
                  value={dataReagendada}
                  onChange={(evento) => setDataReagendada(evento.target.value)}
                />
              </div>
              <div className="form-linha">
                <div>
                  <label htmlFor="hora-inicio">Das</label>
                  <input id="hora-inicio" type="time" required value={horaInicio} onChange={(evento) => setHoraInicio(evento.target.value)} />
                </div>
                <div>
                  <label htmlFor="hora-fim">Até</label>
                  <input id="hora-fim" type="time" required value={horaFim} onChange={(evento) => setHoraFim(evento.target.value)} />
                </div>
              </div>
              {erroJanela && <Alerta tipo="erro">{erroJanela}</Alerta>}
              <p className="texto-apoio mb-0">O passageiro recebe a confirmação automaticamente, se houver contato cadastrado.</p>
            </fieldset>
          )}

          <div className="mt-5">
            <label htmlFor="descricao">Descrição adicional (opcional)</label>
            <textarea
              id="descricao"
              rows={3}
              value={descricaoAdicional}
              onChange={(evento) => setDescricaoAdicional(evento.target.value)}
              placeholder="Ex.: portaria fechada, ninguém atendeu o interfone"
            />
          </div>

          <div className="acao-fixa">
            <button type="button" className="grande bloco" onClick={() => setConfirmando(true)} disabled={!motivoOcorrenciaId || !janelaPronta || enviando}>
              {enviando ? "Registrando…" : "Registrar ocorrência"}
            </button>
            {!motivoOcorrenciaId && (
              <p className="texto-apoio centro mb-0">
                Escolha um motivo para continuar.
              </p>
            )}
            {motivoOcorrenciaId && !janelaPronta && !erroJanela && (
              <p className="texto-apoio centro mb-0">Informe a data e a faixa de horário combinadas com o passageiro.</p>
            )}
          </div>
          <ConfirmarAcao
            aberto={confirmando}
            titulo="Registrar ocorrência?"
            descricao={
              janelaInicio && janelaFim
                ? `A entrega voltará para a lista de disponíveis reagendada para ${formatarJanela({ inicio: janelaInicio, fim: janelaFim })}, e o passageiro recebe a confirmação. Isso não pode ser desfeito por aqui.`
                : "A entrega será marcada como não realizada e voltará para a lista de disponíveis. Isso não pode ser desfeito por aqui."
            }
            rotuloConfirmar="Registrar ocorrência"
            ocupado={enviando}
            aoConfirmar={enviar}
            aoCancelar={() => setConfirmando(false)}
          />
        </>
      )}

      <Ajuda>
        <p>Use quando não for possível entregar a bagagem. Escolha o motivo e, se quiser, descreva o que aconteceu. Se você combinou outro dia ou horário com o passageiro, escolha o motivo de reagendamento e informe a data e a faixa de horário. A entrega volta para a lista de disponíveis para uma nova tentativa, sem perder o histórico.</p>
      </Ajuda>
    </TelaMotorista>
  );
}
