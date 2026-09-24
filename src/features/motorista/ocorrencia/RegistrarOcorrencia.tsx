import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../../../shared/api/ApiError";
import { executarOuEnfileirar } from "../offline-sync/fila";
import { IndicadorSincronizacao } from "../offline-sync/IndicadorSincronizacao";
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
      await executarOuEnfileirar(
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
      navegar("/motorista");
    } catch (excecao) {
      setErro(excecao instanceof ApiError ? excecao.message : "Não foi possível registrar a ocorrência.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main style={{ maxWidth: 560, margin: "2rem auto", padding: "0 1rem" }}>
      <IndicadorSincronizacao />
      <Link to={`/motorista/entregas/${entregaId}`}>← Voltar para a entrega</Link>
      <h1>Ocorrência de não entrega</h1>

      {erro && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {erro}
        </p>
      )}

      {!motivos && <p role="status">Carregando motivos…</p>}

      {motivos && motivos.length === 0 && !erro && (
        <p role="alert" style={{ color: "var(--aviso)" }}>
          Nenhum motivo de ocorrência está configurado para a sua empresa. Fale com o administrador antes de continuar.
        </p>
      )}

      {motivos && motivos.length > 0 && (
        <>
          {motivosDoCache && (
            <p role="status" style={{ fontSize: "0.85rem", color: "var(--aviso)" }}>
              Sem conexão: usando a lista de motivos salva neste aparelho. Se o administrador mudou os motivos, o registro pode ser recusado ao sincronizar.
            </p>
          )}
          <label htmlFor="motivo">Motivo *</label>
          <select id="motivo" value={motivoOcorrenciaId} onChange={(evento) => setMotivoOcorrenciaId(evento.target.value)}>
            <option value="">Selecione o motivo</option>
            {motivos.map((motivo) => (
              <option key={motivo.id} value={motivo.id}>
                {motivo.descricao}
              </option>
            ))}
          </select>

          <div style={{ marginTop: "1rem" }}>
            <label htmlFor="descricao">Descrição adicional</label>
            <textarea
              id="descricao"
              rows={3}
              value={descricaoAdicional}
              onChange={(evento) => setDescricaoAdicional(evento.target.value)}
              placeholder="Opcional: detalhe o que aconteceu"
            />
          </div>

          <button onClick={enviar} disabled={!motivoOcorrenciaId || enviando} style={{ marginTop: "1rem" }}>
            {enviando ? "Registrando…" : "Registrar ocorrência e reabrir entrega"}
          </button>
        </>
      )}
    </main>
  );
}
