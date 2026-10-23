import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "../../../../shared/api/ApiError";
import { Ajuda } from "../../../../shared/ui/Ajuda";
import { Alerta, Vazio } from "../../../../shared/ui/Alerta";
import { Icone, type NomeIcone } from "../../../../shared/ui/Icone";
import { TelaMotorista } from "../../layout/TelaMotorista";
import { listarMotivos } from "../../ocorrencia/ocorrenciaService";
import { consultarBdosDisponiveis, consultarPainel } from "../services/painelService";
import type { BdosDisponiveis, ItemPainel, PainelEntregas as PainelEntregasResposta } from "../types";
import { ListaBdosDisponiveis } from "./ListaBdosDisponiveis";
import { STATUS_ENTREGA } from "./statusEntrega";

const ROTULO_MARCO: Record<NonNullable<ItemPainel["marcoMaisRecente"]>, { icone: NomeIcone; texto: string }> = {
  A_CAMINHO: { icone: "carro", texto: "A caminho" },
  CHEGADA: { icone: "pino", texto: "Chegou ao endereço" },
};

/**
 * Tela inicial do motorista (HU19, US1) - painel de entregas pendentes +
 * BDOs disponíveis para assumir. Precede a navegação para captura de BDO
 * (HU01) e para o detalhe de cada entrega.
 */
export function PainelEntregas() {
  const [painel, setPainel] = useState<PainelEntregasResposta | null>(null);
  const [bdosDisponiveis, setBdosDisponiveis] = useState<BdosDisponiveis | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const localizacao = useLocation();
  const navegar = useNavigate();
  const [aviso, setAviso] = useState<string | null>((localizacao.state as { aviso?: string } | null)?.aviso ?? null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const [painelResposta, bdosResposta] = await Promise.all([consultarPainel(), consultarBdosDisponiveis()]);
      setPainel(painelResposta);
      setBdosDisponiveis(bdosResposta);
    } catch (excecao) {
      setErro(excecao instanceof ApiError ? excecao.message : "Não foi possível carregar o painel. Tente novamente.");
    }
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
    setAviso("Entrega assumida. Ela já está na sua lista de pendentes.");
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
      titulo="Minhas entregas"
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
            <Icone nome="sincronizar" /> Tentar de novo
          </button>
        </Alerta>
      )}

      {!painel && !erro && (
        <div className="pilha" role="status" aria-label="Carregando entregas">
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
              {painel.contadorPendentes === 1 ? "entrega pendente" : "entregas pendentes"}
              <small>Toque em uma entrega para ver rota, contato e comprovante.</small>
            </span>
          </div>

          <h2>Para entregar</h2>
          {painel.entregas.length === 0 ? (
            <Vazio icone="checkCirculo" titulo="Nenhuma entrega pendente">
              Assuma um BDO disponível abaixo ou capture um novo pelo botão da câmera.
            </Vazio>
          ) : (
            <ul className="lista">
              {painel.entregas.map((item) => {
                const status = STATUS_ENTREGA[item.status];
                return (
                  <li key={item.entregaId}>
                    <Link to={`/motorista/entregas/${item.entregaId}`} viewTransition className="cartao-link">
                      <div className="cartao-corpo">
                        <div className="cartao-cabecalho">
                          <span className="codigo">{item.bdoNumero ?? "BDO sem número"}</span>
                          {item.marcoMaisRecente ? (
                            <span className="selo selo-info">
                              <Icone nome={ROTULO_MARCO[item.marcoMaisRecente].icone} /> {ROTULO_MARCO[item.marcoMaisRecente].texto}
                            </span>
                          ) : (
                            <span className={`selo selo-${status.tom}`}>{status.texto}</span>
                          )}
                        </div>
                        <div className="destaque">{item.passageiroNome ?? "Passageiro não identificado"}</div>
                        <div className="linha-icone texto-apoio">
                          <Icone nome="pino" />
                          <span>{item.endereco ?? "Endereço não informado"}</span>
                        </div>
                        {item.bagagensCarona.length > 0 && (
                          <div className="linha-icone texto-apoio">
                            <Icone nome="mala" />
                            <span>
                              {item.bagagensCarona.length === 1 ? "+ 1 bagagem carona" : `+ ${item.bagagensCarona.length} bagagens carona`}
                            </span>
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
            <p>
              Toque em uma entrega para ver os detalhes, calcular a rota e registrar o comprovante. Em “Disponíveis para assumir”, toque em
              “Assumir” para incluir uma entrega na sua lista. Sem internet, o que você registrar fica salvo no aparelho e é enviado depois.
            </p>
          </Ajuda>
        </>
      )}
    </TelaMotorista>
  );
}
