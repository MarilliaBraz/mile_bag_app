import { useTextos } from "../../../../shared/i18n/idioma";
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
import type { Coordenada, RotaAlternativa } from "../types";

type RotaPropriaPendente = { tracado: Coordenada[]; justificativa: string };

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
  const [rotaPropriaParaTrocar, setRotaPropriaParaTrocar] = useState<RotaPropriaPendente | null>(null);
  const [rotaPropriaAberta, setRotaPropriaAberta] = useState(false);
  // Muda a cada rota própria registrada: recria o formulário vazio.
  const [versaoRotaPropria, setVersaoRotaPropria] = useState(0);
  const [avisoRota, setAvisoRota] = useState<string | null>(null);
  const t = useTextos().motorista;
  const aguarde = useTextos().comum.aguarde;

  if (!entregaId) {
    return null;
  }

  const emExecucao = rota.trajeto?.status === "EM_EXECUCAO";
  // Os cálculos vêm em ordem cronológica: o último é o que está valendo.
  const rotaEmUso = emExecucao ? rota.trajeto?.calculosRota.at(-1) : undefined;

  async function trocarParaSugerida(alternativa: RotaAlternativa) {
    setAvisoRota(null);
    if (await rota.selecionarSugerida(alternativa)) {
      setAvisoRota(t.rota.rotaTrocada);
    }
  }

  async function usarRotaPropria({ tracado, justificativa }: RotaPropriaPendente) {
    setAvisoRota(null);
    if (await rota.selecionarPropria(tracado, justificativa)) {
      setRotaPropriaAberta(false);
      setVersaoRotaPropria((versao) => versao + 1);
      if (emExecucao) {
        setAvisoRota(t.rota.rotaPropriaRegistrada);
      }
    }
  }

  return (
    <TelaMotorista
      titulo={emExecucao ? t.rota.tituloViagem : t.rota.tituloRota}
      voltarPara={`/motorista/entregas/${entregaId}`}
      rotuloVoltar={t.geral.voltarEntrega}
    >
      {rota.erro && <Alerta tipo="erro">{rota.erro}</Alerta>}

      {rota.pendenteDeSincronizacao && <Alerta tipo="aviso">{t.rota.pendenteSincronizacao}</Alerta>}

      {/* Durante a viagem, o que importa primeiro são os marcos e o encerramento - a escolha de rota desce. */}
      {emExecucao && <MarcosProgresso entregaId={entregaId} checkpoints={rota.trajeto?.checkpoints} aoRegistrar={rota.recarregarTrajeto} />}

      {emExecucao && !rota.divergenciaPendente && (
        <button type="button" className="sucesso grande bloco mt-4" onClick={() => setConfirmandoEncerrar(true)} disabled={rota.ocupado}>
          <Icone nome="checkCirculo" /> {rota.ocupado ? aguarde : t.rota.encerrarViagem}
        </button>
      )}
      <ConfirmarAcao
        aberto={confirmandoEncerrar}
        titulo={t.rota.encerrarTitulo}
        descricao={t.rota.encerrarDescricao}
        rotuloConfirmar={t.rota.encerrarViagem}
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

      {avisoRota && (
        <Alerta tipo="sucesso" aoFechar={() => setAvisoRota(null)}>
          {avisoRota}
        </Alerta>
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
          {!rota.calculo && !rota.erro && <Carregando texto={t.rota.calculando} />}

          {rota.calculo && (
            <>
              <MapaRotas
                calculo={rota.calculo}
                alternativaSelecionada={rota.selecao?.rotaEscolhida.id ?? null}
                // Durante a viagem, tocar numa alternativa troca a rota em uso: pede confirmação.
                aoSelecionar={emExecucao ? setAlternativaParaTrocar : rota.selecionarSugerida}
                titulo={emExecucao ? t.rota.trocarDeRota : undefined}
              >
                {emExecucao && <p className="texto-apoio">{t.rota.rotasDaPosicao}</p>}
              </MapaRotas>
              <ConfirmarAcao
                aberto={alternativaParaTrocar !== null}
                titulo={t.rota.trocarTitulo}
                descricao={t.rota.trocarDescricao}
                rotuloConfirmar={t.rota.trocarDeRota}
                ocupado={rota.ocupado}
                aoConfirmar={() => {
                  if (alternativaParaTrocar) {
                    trocarParaSugerida(alternativaParaTrocar);
                  }
                  setAlternativaParaTrocar(null);
                }}
                aoCancelar={() => setAlternativaParaTrocar(null)}
              />

              {!rota.trajeto && rota.selecao && <IniciarViagem selecao={rota.selecao} aoIniciar={rota.iniciar} ocupado={rota.ocupado} />}

              <button type="button" className="secundario bloco mt-3" onClick={() => rota.recalcular()} disabled={rota.ocupado}>
                <Icone nome="sincronizar" /> {rota.ocupado ? t.rota.recalculando : t.rota.recalcular}
              </button>

              <details
                className="ajuda sem-icone mt-4"
                open={rotaPropriaAberta}
                onToggle={(evento) => setRotaPropriaAberta(evento.currentTarget.open)}
              >
                <summary>{t.rota.usarUmaPropria}</summary>
                <RotaPropria
                  key={versaoRotaPropria}
                  origem={rota.calculo.origem}
                  destino={rota.calculo.destino}
                  // Durante a viagem, a rota própria também troca a rota em uso: pede confirmação.
                  aoConfirmar={(tracado, justificativa) =>
                    emExecucao ? setRotaPropriaParaTrocar({ tracado, justificativa }) : usarRotaPropria({ tracado, justificativa })
                  }
                  desabilitado={rota.ocupado}
                />
              </details>
              <ConfirmarAcao
                aberto={rotaPropriaParaTrocar !== null}
                titulo={t.rota.propriaTitulo}
                descricao={t.rota.propriaDescricao}
                rotuloConfirmar={t.rota.usarRotaPropria}
                ocupado={rota.ocupado}
                aoConfirmar={() => {
                  if (rotaPropriaParaTrocar) {
                    usarRotaPropria(rotaPropriaParaTrocar);
                  }
                  setRotaPropriaParaTrocar(null);
                }}
                aoCancelar={() => setRotaPropriaParaTrocar(null)}
              />
            </>
          )}
        </>
      )}

      {rota.trajeto && <ResumoViagem trajeto={rota.trajeto} />}

      <Ajuda>
        <p>{t.rota.ajuda}</p>
      </Ajuda>
    </TelaMotorista>
  );
}
