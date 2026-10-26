import { Ajuda } from "../../../../shared/ui/Ajuda";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Alerta, Carregando } from "../../../../shared/ui/Alerta";
import { ConfirmarAcao } from "../../../../shared/ui/ConfirmarAcao";
import { Icone } from "../../../../shared/ui/Icone";
import { TelaMotorista } from "../../layout/TelaMotorista";
import { useRota } from "../hooks/useRota";
import { AjusteDestinoManual } from "./AjusteDestinoManual";
import { IniciarViagem } from "./IniciarViagem";
import { JustificativaDivergencia } from "./JustificativaDivergencia";
import { MapaRotas } from "./MapaRotas";
import { MarcosProgresso } from "./MarcosProgresso";
import { ResumoViagem } from "./ResumoViagem";
import { RotaEmUso } from "./RotaEmUso";
import { RotaPropria } from "./RotaPropria";
import type { RotaAlternativa } from "../types";

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
  const [confirmandoEncerrar, setConfirmandoEncerrar] = useState(false);
  const [alternativaParaTrocar, setAlternativaParaTrocar] = useState<RotaAlternativa | null>(null);

  if (!entregaId) {
    return null;
  }

  const emExecucao = rota.trajeto?.status === "EM_EXECUCAO";
  // Os cálculos vêm em ordem cronológica: o último é o que está valendo.
  const rotaEmUso = emExecucao ? rota.trajeto?.calculosRota.at(-1) : undefined;

  return (
    <TelaMotorista titulo={emExecucao ? "Viagem em andamento" : "Rota da entrega"} voltarPara={`/motorista/entregas/${entregaId}`} rotuloVoltar="Voltar para a entrega">
      {rota.erro && <Alerta tipo="erro">{rota.erro}</Alerta>}

      {rota.pendenteDeSincronizacao && <Alerta tipo="aviso">Registro salvo no aparelho e será enviado quando houver conexão.</Alerta>}

      {/* Durante a viagem, o que importa primeiro são os marcos e o encerramento - a escolha de rota desce. */}
      {emExecucao && <MarcosProgresso entregaId={entregaId} checkpoints={rota.trajeto?.checkpoints} aoRegistrar={rota.recarregarTrajeto} />}

      {emExecucao && !rota.divergenciaPendente && (
        <button type="button" className="sucesso grande bloco mt-4" onClick={() => setConfirmandoEncerrar(true)} disabled={rota.ocupado}>
          <Icone nome="checkCirculo" /> {rota.ocupado ? "Aguarde…" : "Encerrar viagem"}
        </button>
      )}
      <ConfirmarAcao
        aberto={confirmandoEncerrar}
        titulo="Encerrar a viagem?"
        descricao="A quilometragem e o tempo serão consolidados com o que foi registrado até agora."
        rotuloConfirmar="Encerrar viagem"
        ocupado={rota.ocupado}
        aoConfirmar={() => {
          setConfirmandoEncerrar(false);
          rota.encerrar();
        }}
        aoCancelar={() => setConfirmandoEncerrar(false)}
      />

      {rota.divergenciaPendente && (
        <JustificativaDivergencia
          mensagem={rota.divergenciaPendente}
          aoReenviar={(justificativa) => rota.encerrar(justificativa)}
          ocupado={rota.ocupado}
        />
      )}

      {rotaEmUso && <RotaEmUso calculo={rotaEmUso} />}

      {rota.precisaDestinoManual ? (
        <AjusteDestinoManual
          centroInicial={rota.calculo?.origem ?? CENTRO_PADRAO}
          aoConfirmar={(destino) => rota.recalcular(destino)}
          ocupado={rota.ocupado}
        />
      ) : (
        <>
          {!rota.calculo && !rota.erro && <Carregando texto="Calculando rota a partir da sua posição…" />}

          {rota.calculo && (
            <>
              <MapaRotas
                calculo={rota.calculo}
                alternativaSelecionada={rota.selecao?.rotaEscolhida.id ?? null}
                // Durante a viagem, tocar numa alternativa troca a rota em uso: pede confirmação.
                aoSelecionar={emExecucao ? setAlternativaParaTrocar : rota.selecionarSugerida}
                titulo={emExecucao ? "Trocar de rota" : undefined}
              >
                {emExecucao && (
                  <p className="texto-apoio">Rotas a partir da sua posição atual. Escolha uma só se quiser trocar a rota em uso.</p>
                )}
              </MapaRotas>
              <ConfirmarAcao
                aberto={alternativaParaTrocar !== null}
                titulo="Trocar de rota?"
                descricao="A rota escolhida passa a valer a partir de agora. A rota anterior fica guardada no histórico da viagem."
                rotuloConfirmar="Trocar de rota"
                ocupado={rota.ocupado}
                aoConfirmar={() => {
                  if (alternativaParaTrocar) {
                    rota.selecionarSugerida(alternativaParaTrocar);
                  }
                  setAlternativaParaTrocar(null);
                }}
                aoCancelar={() => setAlternativaParaTrocar(null)}
              />

              {!rota.trajeto && rota.selecao && <IniciarViagem selecao={rota.selecao} aoIniciar={rota.iniciar} ocupado={rota.ocupado} />}

              <button type="button" className="secundario bloco mt-3" onClick={() => rota.recalcular()} disabled={rota.ocupado}>
                <Icone nome="sincronizar" /> {rota.ocupado ? "Recalculando…" : "Recalcular a partir da minha posição"}
              </button>

              <details className="ajuda sem-icone mt-4">
                <summary>Usar uma rota própria</summary>
                <RotaPropria centro={rota.calculo.destino} aoConfirmar={rota.selecionarPropria} desabilitado={rota.ocupado} />
              </details>
            </>
          )}
        </>
      )}

      {rota.trajeto && <ResumoViagem trajeto={rota.trajeto} />}

      <Ajuda>
        <p>Calcule as rotas, compare distância e tempo e escolha uma. Você também pode traçar uma rota própria. Ao recalcular, o cálculo anterior fica guardado no histórico da viagem.</p>
      </Ajuda>
    </TelaMotorista>
  );
}
