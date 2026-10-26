import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../../../shared/api/ApiError";
import { executarOuEnfileirar } from "../offline-sync/fila";
import { TelaMotorista } from "../layout/TelaMotorista";
import { Ajuda } from "../../../shared/ui/Ajuda";
import { Alerta, Carregando } from "../../../shared/ui/Alerta";
import { ConfirmarAcao } from "../../../shared/ui/ConfirmarAcao";
import { formatarJanela } from "../../../shared/format/formatar";
import { useTextos } from "../../../shared/i18n/idioma";
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
  const textos = useTextos();
  const t = textos.motorista.ocorrencia;

  useEffect(() => {
    listarMotivosComOrigem()
      .then((resposta) => {
        setMotivos(resposta.motivos);
        setMotivosDoCache(resposta.doCache);
      })
      .catch((excecao) => {
        setErro(excecao instanceof ApiError ? excecao.message : t.falhaMotivos);
        setMotivos([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exigeJanela = motivos?.find((motivo) => motivo.id === motivoOcorrenciaId)?.reagendamento === true;
  const janelaInicio = exigeJanela ? instante(dataReagendada, horaInicio) : null;
  const janelaFim = exigeJanela ? instante(dataReagendada, horaFim) : null;
  // A API só confere fim > início: o "ainda não passou" fica aqui, porque um registro offline pode sincronizar depois da janela.
  const erroJanela =
    janelaInicio && janelaFim
      ? new Date(janelaFim) <= new Date(janelaInicio)
        ? t.fimAntesInicio
        : new Date(janelaFim) <= new Date()
          ? t.jaPassou
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
          aviso: enfileirado ? t.naFila : exigeJanela ? t.reagendamentoRegistrado : t.registrada,
        },
      });
    } catch (excecao) {
      setConfirmando(false);
      setErro(excecao instanceof ApiError ? excecao.message : t.falha);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <TelaMotorista titulo={t.titulo} voltarPara={`/motorista/entregas/${entregaId}`} rotuloVoltar={textos.motorista.geral.voltarEntrega}>
      <p className="texto-apoio">{t.explicacao}</p>

      {erro && <Alerta tipo="erro">{erro}</Alerta>}

      {!motivos && <Carregando texto={t.carregandoMotivos} />}

      {motivos && motivos.length === 0 && !erro && <Alerta tipo="aviso">{t.semMotivos}</Alerta>}

      {motivos && motivos.length > 0 && (
        <>
          {motivosDoCache && <Alerta tipo="aviso">{t.motivosDoCache}</Alerta>}

          <fieldset className="escolhas mt-5">
            <legend>
              {t.oQueAconteceu}{" "}
              <span className="campo-obrigatorio" aria-hidden="true">
                *
              </span>
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
                {t.quandoPode}{" "}
                <span className="campo-obrigatorio" aria-hidden="true">
                  *
                </span>
              </legend>
              <div className="campo">
                <label htmlFor="data-reagendada">{t.dataCombinada}</label>
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
                  <label htmlFor="hora-inicio">{t.das}</label>
                  <input
                    id="hora-inicio"
                    type="time"
                    required
                    value={horaInicio}
                    onChange={(evento) => setHoraInicio(evento.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="hora-fim">{t.ate}</label>
                  <input id="hora-fim" type="time" required value={horaFim} onChange={(evento) => setHoraFim(evento.target.value)} />
                </div>
              </div>
              {erroJanela && <Alerta tipo="erro">{erroJanela}</Alerta>}
              <p className="texto-apoio mb-0">{t.passageiroConfirmacao}</p>
            </fieldset>
          )}

          <div className="mt-5">
            <label htmlFor="descricao">{t.descricao}</label>
            <textarea
              id="descricao"
              rows={3}
              value={descricaoAdicional}
              onChange={(evento) => setDescricaoAdicional(evento.target.value)}
              placeholder={t.descricaoDica}
            />
          </div>

          <div className="acao-fixa">
            <button
              type="button"
              className="grande bloco"
              onClick={() => setConfirmando(true)}
              disabled={!motivoOcorrenciaId || !janelaPronta || enviando}
            >
              {enviando ? t.registrando : t.registrar}
            </button>
            {!motivoOcorrenciaId && <p className="texto-apoio centro mb-0">{t.escolhaMotivo}</p>}
            {motivoOcorrenciaId && !janelaPronta && !erroJanela && <p className="texto-apoio centro mb-0">{t.informeJanela}</p>}
          </div>
          <ConfirmarAcao
            aberto={confirmando}
            titulo={t.confirmarTitulo}
            descricao={
              janelaInicio && janelaFim
                ? t.confirmarReagendada(formatarJanela({ inicio: janelaInicio, fim: janelaFim }))
                : t.confirmarSemJanela
            }
            rotuloConfirmar={t.registrar}
            ocupado={enviando}
            aoConfirmar={enviar}
            aoCancelar={() => setConfirmando(false)}
          />
        </>
      )}

      <Ajuda>
        <p>{t.ajuda}</p>
      </Ajuda>
    </TelaMotorista>
  );
}
