import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "../../../../shared/services/ApiError";
import { Ajuda } from "../../../../shared/components/Ajuda";
import { Alerta, Vazio } from "../../../../shared/components/Alerta";
import { AvisoJanelaReagendamento } from "../../../../shared/components/AvisoJanelaReagendamento";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Icone, type NomeIcone } from "../../../../shared/components/Icone";
import { TelaMotorista } from "../../../../shared/components/TelaMotorista";
import { listarPendentesDeConferencia } from "../../../../shared/services/bdoService";
import type { BdoResponse } from "../../../../shared/types/bdo";
import { listarMotivos } from "../../../../shared/services/ocorrenciaService";
import { marcarViagemEmAndamento } from "../../../../shared/utils/viagemEmAndamento";
import { consultarBdosDisponiveis, consultarPainel } from "../services/painelService";
import type { BdosDisponiveis, ItemPainel, PainelEntregas as PainelEntregasResposta } from "../types";
import { FotosParaConferir } from "./FotosParaConferir";
import { ListaBdosDisponiveis } from "./ListaBdosDisponiveis";
import { TOM_STATUS_ENTREGA } from "../utils/statusEntrega";

const ROTULO_MARCO: Record<NonNullable<ItemPainel["marcoMaisRecente"]>, { icone: NomeIcone; texto: "marcoACaminho" | "marcoChegada" }> = {
  A_CAMINHO: { icone: "carro", texto: "marcoACaminho" },
  CHEGADA: { icone: "pino", texto: "marcoChegada" },
};

/**
 * Tela inicial do motorista (HU19, US1) - painel de entregas pendentes +
 * BDOs disponíveis para assumir. Precede a navegação para captura de BDO
 * (HU01) e para o detalhe de cada entrega.
 */
export function PainelEntregas() {
  const [painel, setPainel] = useState<PainelEntregasResposta | null>(null);
  const [bdosDisponiveis, setBdosDisponiveis] = useState<BdosDisponiveis | null>(null);
  const [fotosParaConferir, setFotosParaConferir] = useState<BdoResponse[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const t = useTextos().motorista;
  const localizacao = useLocation();
  const navegar = useNavigate();
  const [aviso, setAviso] = useState<string | null>((localizacao.state as { aviso?: string } | null)?.aviso ?? null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const [painelResposta, bdosResposta] = await Promise.all([consultarPainel(), consultarBdosDisponiveis()]);
      setPainel(painelResposta);
      setBdosDisponiveis(bdosResposta);
      // HU31: viagem iniciada em outro momento (ou outro aparelho) também envia a posição ao link de acompanhamento.
      if (painelResposta.entregas.some((item) => item.status === "EM_ANDAMENTO")) {
        marcarViagemEmAndamento(true);
      }
      // Complemento do painel: uma falha aqui não esconde as entregas.
      listarPendentesDeConferencia()
        .then(setFotosParaConferir)
        .catch(() => undefined);
    } catch (excecao) {
      setErro(excecao instanceof ApiError ? excecao.message : t.painel.falhaAoCarregar);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    carregar();
    // Aquece a cópia local dos motivos de ocorrência enquanto há conexão: sem ela o motorista não conseguiria registrar uma ocorrência offline.
    listarMotivos().catch(() => undefined);
  }, [carregar]);

  // O aviso já foi copiado para o estado: limpa o da navegação para não reaparecer ao recarregar a página.
  useEffect(() => {
    if (localizacao.state) {
      navegar(localizacao.pathname, { replace: true, state: null });
    }
  }, [localizacao, navegar]);

  // FR-009: ao assumir um BDO, ele some da lista de disponíveis e a lista de
  // pendentes/contador precisam refletir a nova entrega - reconsulta o
  // painel inteiro em vez de tentar montar o item localmente.
  function aoAutoatribuir(bdoId: string) {
    setAviso(t.painel.entregaAssumida);
    setBdosDisponiveis((atual) => (atual ? { bdos: atual.bdos.filter((bdo) => bdo.bdoId !== bdoId) } : atual));
    consultarPainel()
      .then(setPainel)
      .catch(() => {
        // FR-006 (offline): a lista de pendentes ja mostrada continua valida;
        // uma falha aqui nao deve travar a tela.
      });
  }

  return (
    <TelaMotorista
      titulo={t.painel.titulo}
      navegacao
      aoSincronizar={carregar}
      acoesTopo={
        <span className="marca" aria-hidden="true">
          <img src="/icone-app.svg" alt="" />
        </span>
      }
    >
      {aviso && (
        <Alerta tipo="sucesso" aoFechar={() => setAviso(null)}>
          {aviso}
        </Alerta>
      )}

      {erro && (
        <Alerta tipo="erro">
          <p>{erro}</p>
          <button type="button" className="secundario" onClick={carregar}>
            <Icone nome="sincronizar" /> {t.geral.tentarDeNovo}
          </button>
        </Alerta>
      )}

      {!painel && !erro && (
        <div className="pilha" role="status" aria-label={t.painel.carregando}>
          <div className="esqueleto esqueleto-curto" />
          <div className="esqueleto" />
          <div className="esqueleto" />
        </div>
      )}

      {painel && (
        <>
          <div className="resumo">
            <span className="resumo-numero">{painel.contadorPendentes}</span>
            <span className="resumo-texto">
              {t.painel.pendentes(painel.contadorPendentes)}
              <small>{t.painel.toqueParaVer}</small>
            </span>
          </div>

          <FotosParaConferir bdos={fotosParaConferir} />

          <h2>{t.painel.paraEntregar}</h2>
          {painel.entregas.length === 0 ? (
            <Vazio icone="checkCirculo" titulo={t.painel.nenhumaPendente}>
              {t.painel.nenhumaPendenteDica}
            </Vazio>
          ) : (
            <ul className="lista">
              {painel.entregas.map((item) => {
                const status = { texto: t.status[item.status], tom: TOM_STATUS_ENTREGA[item.status] };
                return (
                  <li key={item.entregaId}>
                    <Link to={`/motorista/entregas/${item.entregaId}`} viewTransition className="cartao-link">
                      <div className="cartao-corpo">
                        <div className="cartao-cabecalho">
                          <span className="codigo">{item.bdoNumero ?? t.geral.bdoSemNumero}</span>
                          {item.marcoMaisRecente ? (
                            <span className="selo selo-info">
                              <Icone nome={ROTULO_MARCO[item.marcoMaisRecente].icone} />{" "}
                              {t.painel[ROTULO_MARCO[item.marcoMaisRecente].texto]}
                            </span>
                          ) : (
                            <span className={`selo selo-${status.tom}`}>{status.texto}</span>
                          )}
                        </div>
                        <div className="destaque">{item.passageiroNome ?? t.geral.passageiroNaoIdentificado}</div>
                        <div className="linha-icone texto-apoio">
                          <Icone nome="pino" />
                          <span>{item.endereco ?? t.geral.enderecoNaoInformado}</span>
                        </div>
                        <AvisoJanelaReagendamento janela={item.janelaReagendamento} />
                        {item.bagagensCarona.length > 0 && (
                          <div className="linha-icone texto-apoio">
                            <Icone nome="mala" />
                            <span>{t.painel.bagagensCarona(item.bagagensCarona.length)}</span>
                          </div>
                        )}
                      </div>
                      <Icone nome="chevron" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {bdosDisponiveis && <ListaBdosDisponiveis bdos={bdosDisponiveis.bdos} aoAutoatribuir={aoAutoatribuir} />}

          <Ajuda>
            <p>{t.painel.ajuda}</p>
          </Ajuda>
        </>
      )}
    </TelaMotorista>
  );
}
