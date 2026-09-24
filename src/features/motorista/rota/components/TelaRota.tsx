import { Link, useParams } from "react-router-dom";
import { useRota } from "../hooks/useRota";
import { AjusteDestinoManual } from "./AjusteDestinoManual";
import { IniciarViagem } from "./IniciarViagem";
import { JustificativaDivergencia } from "./JustificativaDivergencia";
import { MapaRotas } from "./MapaRotas";
import { ResumoViagem } from "./ResumoViagem";
import { RotaPropria } from "./RotaPropria";

// Centro de fallback do mapa de ajuste manual (Goiânia): só usado quando a
// geocodificação falhou e ainda não há nenhuma coordenada conhecida da
// entrega para centralizar.
const CENTRO_PADRAO = { latitude: -16.6869, longitude: -49.2648 };

/**
 * Tela de rota e viagem (HU03 + HU04) - cálculo, escolha (sugerida ou
 * própria), início da viagem e encerramento numa única tela, acessível
 * durante toda a execução para permitir recálculo a qualquer momento
 * (RI03), não só antes de iniciar.
 */
export function TelaRota() {
  const { entregaId } = useParams<{ entregaId: string }>();
  const rota = useRota(entregaId ?? "");

  if (!entregaId) {
    return null;
  }

  const emExecucao = rota.trajeto?.status === "EM_EXECUCAO";

  return (
    <main style={{ maxWidth: 560, margin: "2rem auto", padding: "0 1rem" }}>
      <Link to={`/motorista/entregas/${entregaId}`}>← Voltar para a entrega</Link>
      <h1>Rota da entrega</h1>

      {rota.erro && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {rota.erro}
        </p>
      )}

      {rota.precisaDestinoManual ? (
        <AjusteDestinoManual
          centroInicial={rota.calculo?.origem ?? CENTRO_PADRAO}
          aoConfirmar={(destino) => rota.recalcular(destino)}
          ocupado={rota.ocupado}
        />
      ) : (
        <>
          {!rota.calculo && !rota.erro && <p role="status">Calculando rota…</p>}

          {rota.calculo && (
            <>
              <MapaRotas
                calculo={rota.calculo}
                alternativaSelecionada={rota.selecao?.rotaEscolhida.id ?? null}
                aoSelecionar={rota.selecionarSugerida}
              />
              <button className="secundario" onClick={() => rota.recalcular()} disabled={rota.ocupado}>
                {rota.ocupado ? "Recalculando…" : "Recalcular a partir da minha posição"}
              </button>

              <RotaPropria centro={rota.calculo.destino} aoConfirmar={rota.selecionarPropria} desabilitado={rota.ocupado} />
            </>
          )}
        </>
      )}

      {!rota.trajeto && rota.selecao && <IniciarViagem selecao={rota.selecao} aoIniciar={rota.iniciar} ocupado={rota.ocupado} />}

      {rota.trajeto && <ResumoViagem trajeto={rota.trajeto} />}

      {emExecucao && !rota.divergenciaPendente && (
        <button onClick={() => rota.encerrar()} disabled={rota.ocupado} style={{ marginTop: "1rem" }}>
          {rota.ocupado ? "Encerrando…" : "Encerrar viagem"}
        </button>
      )}

      {rota.divergenciaPendente && (
        <JustificativaDivergencia
          mensagem={rota.divergenciaPendente}
          aoReenviar={(justificativa) => rota.encerrar(justificativa)}
          ocupado={rota.ocupado}
        />
      )}
    </main>
  );
}
