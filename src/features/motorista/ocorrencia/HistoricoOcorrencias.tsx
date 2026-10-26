import { useEffect, useState } from "react";
import { formatarDataHora, formatarJanela } from "../../../shared/format/formatar";
import { useTextos } from "../../../shared/i18n/idioma";
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
  const t = useTextos().motorista.ocorrencia;

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
    <section>
      <h2>{t.tentativasAnteriores(ocorrencias.length)}</h2>
      <ul className="linha-tempo cartao">
        {ocorrencias.map((ocorrencia) => (
          <li key={ocorrencia.id}>
            <strong>{descricaoPorMotivo[ocorrencia.motivoOcorrenciaId] ?? t.motivoIndisponivel}</strong>
            <div className="texto-apoio">{formatarDataHora(ocorrencia.dataHora)}</div>
            {ocorrencia.janelaInicio && ocorrencia.janelaFim && (
              <div className="texto-apoio">
                {t.reagendadaPara(formatarJanela({ inicio: ocorrencia.janelaInicio, fim: ocorrencia.janelaFim }))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
