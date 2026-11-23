import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Ajuda } from "../../../../shared/components/Ajuda";
import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Alerta, Carregando } from "../../../../shared/components/Alerta";
import { ConfirmarAcao } from "../../../../shared/components/ConfirmarAcao";
import { Icone } from "../../../../shared/components/Icone";
import { TelaMotorista } from "../../../../shared/components/TelaMotorista";
import { useRota } from "../hooks/useRota";
import { AjusteDestinoManual } from "./AjusteDestinoManual";
import { IniciarViagem } from "./IniciarViagem";
import { useRetiradaFeita } from "../hooks/useRetiradaFeita";
import { limparRetiradaLocal } from "../../../../shared/utils/retiradaLocal";
import { ListaRotas, MapaRotas } from "./MapaRotas";
import { MarcoChegada } from "./MarcoChegada";
import { NavegarComWaze } from "./NavegarComWaze";
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
 * Tela de rota e viagem (HU03 + HU04), "um passo de cada vez" (2026-11-22): o motorista vê só o próximo passo em
 * destaque e o resto fica recolhido em "Ver outras rotas" e "Mais opções".
 *
 * - Antes da viagem: mapa, a rota mais rápida já escolhida e "Iniciar viagem".
 * - Em viagem: "Navegar com o Waze" e "Cheguei ao endereço" (que leva ao registro da entrega); depois da chegada,
 *   "Registrar entrega". Trocar de rota, recalcular (RI03) e rota própria continuam em "Mais opções".
 */
export function TelaRota() {
  const { entregaId } = useParams<{ entregaId: string }>();
  const rota = useRota(entregaId ?? "");
  const [alternativaParaTrocar, setAlternativaParaTrocar] = useState<RotaAlternativa | null>(null);
  const [rotaPropriaParaTrocar, setRotaPropriaParaTrocar] = useState<RotaPropriaPendente | null>(null);
  const [rotaPropriaAberta, setRotaPropriaAberta] = useState(false);
  // Muda a cada rota própria registrada: recria o formulário vazio.
  const [versaoRotaPropria, setVersaoRotaPropria] = useState(0);
  const [avisoRota, setAvisoRota] = useState<string | null>(null);
  const retiradaFeita = useRetiradaFeita(entregaId ?? "");
  // Aviso de quem trouxe até aqui (ex.: retirada registrada ou salva na fila).
  const avisoChegada = (useLocation().state as { aviso?: string } | null)?.aviso;
  const viagemIniciada = !!rota.trajeto;
  useEffect(() => {
    if (viagemIniciada && entregaId) {
      limparRetiradaLocal(entregaId);
    }
  }, [viagemIniciada, entregaId]);
  const t = useTextos().motorista;

  if (!entregaId) {
    return null;
  }

  const emExecucao = rota.trajeto?.status === "EM_EXECUCAO";
  // Os cálculos vêm em ordem cronológica: o último é o que está valendo.
  const rotaEmUso = emExecucao ? rota.trajeto?.calculosRota.at(-1) : undefined;
  const chegou = !!rota.trajeto?.checkpoints.some((checkpoint) => checkpoint.tipo === "CHEGADA");
  const alternativaSelecionada = rota.selecao?.rotaEscolhida.id ?? null;

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

  const linkRegistrarEntrega = (destaque: boolean) => (
    <Link
      to={`/motorista/entregas/${entregaId}/comprovante`}
      viewTransition
      className={`botao bloco mt-3${destaque ? " sucesso grande" : " secundario"}`}
    >
      <Icone nome="checkCirculo" /> {t.detalhe.registrarEntrega}
    </Link>
  );

  // Recalcular e rota própria: raros, ficam fora do caminho principal - antes e durante a viagem.
  const maisOpcoes = rota.calculo && (!rota.trajeto || emExecucao) && (
    <details className="ajuda sem-icone mt-4">
      <summary>{t.rota.maisOpcoes}</summary>
      {emExecucao && rotaEmUso && <RotaEmUso calculo={rotaEmUso} />}
      {emExecucao && (
        <>
          <h2>{t.rota.trocarDeRota}</h2>
          <ListaRotas calculo={rota.calculo} alternativaSelecionada={alternativaSelecionada} aoSelecionar={setAlternativaParaTrocar}>
            <p className="texto-apoio">{t.rota.rotasDaPosicao}</p>
          </ListaRotas>
        </>
      )}
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
      {/* Esqueceu o "Cheguei": a entrega pode ser registrada daqui também. */}
      {emExecucao && !chegou && linkRegistrarEntrega(false)}
      {emExecucao && rota.trajeto && <ResumoViagem trajeto={rota.trajeto} />}
    </details>
  );

  return (
    <TelaMotorista
      titulo={emExecucao ? t.rota.tituloViagem : t.rota.tituloRota}
      voltarPara={`/motorista/entregas/${entregaId}`}
      rotuloVoltar={t.geral.voltarEntrega}
    >
      {rota.erro && <Alerta tipo="erro">{rota.erro}</Alerta>}
      {/* O aviso de quem trouxe até aqui (ex.: "retirada registrada") só vale antes da viagem. */}
      {avisoChegada && !viagemIniciada && <Alerta tipo="sucesso">{avisoChegada}</Alerta>}
      {rota.pendenteDeSincronizacao && <Alerta tipo="aviso">{t.rota.pendenteSincronizacao}</Alerta>}
      {avisoRota && (
        <Alerta tipo="sucesso" aoFechar={() => setAvisoRota(null)}>
          {avisoRota}
        </Alerta>
      )}

      {emExecucao && (
        <section>
          <p className="texto-apoio mb-0">{chegou ? t.rota.passoRegistrar : t.rota.passoEmViagem}</p>
          {chegou ? (
            linkRegistrarEntrega(true)
          ) : (
            <>
              {rota.calculo && <NavegarComWaze destino={rota.calculo.destino} destaque />}
              <MarcoChegada entregaId={entregaId} />
            </>
          )}
        </section>
      )}

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
              <MapaRotas calculo={rota.calculo} alternativaSelecionada={alternativaSelecionada} />

              {!rota.trajeto && (
                <>
                  {/* Sem rota escolhida não há "Iniciar viagem" (a mais rápida vem escolhida; isto cobre a falha). */}
                  {!rota.selecao && !rota.pendenteDeSincronizacao && rota.calculo.alternativas.length > 0 && (
                    <Alerta tipo="aviso">{t.rota.escolhaParaIniciar}</Alerta>
                  )}
                  {rota.selecao && (
                    <IniciarViagem
                      entregaId={entregaId}
                      selecao={rota.selecao}
                      aoIniciar={rota.iniciar}
                      ocupado={rota.ocupado}
                      retiradaFeita={retiradaFeita}
                    />
                  )}
                  <details className="ajuda sem-icone mt-4" open={!rota.selecao}>
                    <summary>{t.rota.verOutrasRotas(rota.calculo.alternativas.length)}</summary>
                    <ListaRotas
                      calculo={rota.calculo}
                      alternativaSelecionada={alternativaSelecionada}
                      aoSelecionar={rota.selecionarSugerida}
                    />
                  </details>
                </>
              )}

              {maisOpcoes}

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

      {/* Viagem já encerrada (entrega registrada): só o resumo. */}
      {rota.trajeto && !emExecucao && <ResumoViagem trajeto={rota.trajeto} />}

      <Ajuda>
        <p>{t.rota.ajuda}</p>
      </Ajuda>
    </TelaMotorista>
  );
}
