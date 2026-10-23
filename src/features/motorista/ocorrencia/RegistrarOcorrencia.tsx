import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../../../shared/api/ApiError";
import { executarOuEnfileirar } from "../offline-sync/fila";
import { TelaMotorista } from "../layout/TelaMotorista";
import { Ajuda } from "../../../shared/ui/Ajuda";
import { Alerta, Carregando } from "../../../shared/ui/Alerta";
import { ConfirmarAcao } from "../../../shared/ui/ConfirmarAcao";
import { listarMotivosComOrigem, registrarOcorrencia, type MotivoOcorrencia } from "./ocorrenciaService";

/**
 * Registro de ocorrência de não entrega (HU07) - o motorista escolhe um dos
 * motivos configurados pelo administrador do tenant (HU11) e, ao confirmar,
 * a entrega volta para `REABERTA`, disponível para nova tentativa, sem
 * perder o histórico nem os vínculos de bagagem carona (HU05, FR-005).
 */
export function RegistrarOcorrencia() {
  const { entregaId } = useParams<{ entregaId: string }>();
  const navegar = useNavigate();

  const [motivos, setMotivos] = useState<MotivoOcorrencia[] | null>(null);
  const [motivosDoCache, setMotivosDoCache] = useState(false);
  const [motivoOcorrenciaId, setMotivoOcorrenciaId] = useState("");
  const [descricaoAdicional, setDescricaoAdicional] = useState("");
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

  async function enviar() {
    if (!entregaId || !motivoOcorrenciaId) {
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
          }),
        {
          tipoEvento: "OCORRENCIA_REGISTRADA",
          payload: { entregaId, motivoOcorrenciaId, descricaoAdicional: descricaoAdicional.trim() || null },
        },
      );
      navegar("/motorista", {
        state: {
          aviso: enfileirado
            ? "Ocorrência salva neste aparelho. Ela será enviada assim que houver conexão."
            : "Ocorrência registrada. A entrega voltou para a lista de pendentes.",
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
      <p className="texto-apoio">A entrega volta para a sua lista de pendentes para uma nova tentativa, sem perder o histórico.</p>

      {erro && <Alerta tipo="erro">{erro}</Alerta>}

      {!motivos && <Carregando texto="Carregando motivos…" />}

      {motivos && motivos.length === 0 && !erro && (
        <Alerta tipo="aviso">
          Nenhum motivo de ocorrência está configurado para a sua empresa. Fale com o administrador antes de continuar.
        </Alerta>
      )}

      {motivos && motivos.length > 0 && (
        <>
          {motivosDoCache && (
            <Alerta tipo="aviso">
              Sem conexão: usando a lista de motivos salva neste aparelho. Se o administrador mudou os motivos, o registro pode ser recusado
              ao sincronizar.
            </Alerta>
          )}

          <fieldset className="escolhas mt-5">
            <legend>
              O que aconteceu?{" "}
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
            <button type="button" className="grande bloco" onClick={() => setConfirmando(true)} disabled={!motivoOcorrenciaId || enviando}>
              {enviando ? "Registrando…" : "Registrar ocorrência"}
            </button>
            {!motivoOcorrenciaId && <p className="texto-apoio centro mb-0">Escolha um motivo para continuar.</p>}
          </div>
          <ConfirmarAcao
            aberto={confirmando}
            titulo="Registrar ocorrência?"
            descricao="A entrega será marcada como não realizada e voltará para a lista de pendentes. Isso não pode ser desfeito por aqui."
            rotuloConfirmar="Registrar ocorrência"
            ocupado={enviando}
            aoConfirmar={enviar}
            aoCancelar={() => setConfirmando(false)}
          />
        </>
      )}

      <Ajuda>
        <p>
          Use quando não for possível entregar a bagagem. Escolha o motivo e, se quiser, descreva o que aconteceu. A entrega volta para a
          sua lista de pendentes para uma nova tentativa, sem perder o histórico.
        </p>
      </Ajuda>
    </TelaMotorista>
  );
}
