import { useEffect, useState } from "react";
import { listarMotivos, listarOcorrencias, type OcorrenciaResponse } from "./ocorrenciaService";

/**
 * Tentativas anteriores de entrega (HU07, FR-004) - o histórico é aditivo:
 * cada ocorrência registrada continua visível mesmo depois de a entrega ser
 * reaberta e concluída em outra tentativa.
 *
 * <p>O catálogo de motivos (HU11) lista só os ativos, então uma ocorrência
 * antiga cujo motivo foi desativado desde então aparece sem a descrição -
 * melhor do que esconder a tentativa.</p>
 */
export function HistoricoOcorrencias({ entregaId }: { entregaId: string }) {
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaResponse[]>([]);
  const [descricaoPorMotivo, setDescricaoPorMotivo] = useState<Record<string, string>>({});

  useEffect(() => {
    // Falha aqui não deve derrubar a tela de detalhe: o histórico é
    // complementar, não o conteúdo principal.
    Promise.all([listarOcorrencias(entregaId), listarMotivos()])
      .then(([registros, motivos]) => {
        setOcorrencias(registros);
        setDescricaoPorMotivo(Object.fromEntries(motivos.map((motivo) => [motivo.id, motivo.descricao])));
      })
      .catch(() => undefined);
  }, [entregaId]);

  if (ocorrencias.length === 0) {
    return null;
  }

  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h2>Tentativas anteriores ({ocorrencias.length})</h2>
      <ul>
        {ocorrencias.map((ocorrencia) => (
          <li key={ocorrencia.id}>
            {new Date(ocorrencia.dataHora).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })} —{" "}
            {descricaoPorMotivo[ocorrencia.motivoOcorrenciaId] ?? "motivo não disponível"}
          </li>
        ))}
      </ul>
    </section>
  );
}
