import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "../../../../shared/api/ApiError";
import { BotaoSair } from "../../../../shared/auth/BotaoSair";
import { Ajuda } from "../../../../shared/ui/Ajuda";
import { PreferenciasAcessibilidade } from "../../../../shared/ui/PreferenciasAcessibilidade";
import { Icone, type NomeIcone } from "../../../../shared/ui/Icone";
import { IndicadorSincronizacao } from "../../offline-sync/IndicadorSincronizacao";
import { listarMotivos } from "../../ocorrencia/ocorrenciaService";
import { consultarBdosDisponiveis, consultarPainel } from "../services/painelService";
import type { BdosDisponiveis, ItemPainel, PainelEntregas as PainelEntregasResposta } from "../types";
import { ListaBdosDisponiveis } from "./ListaBdosDisponiveis";

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
    <main style={{ maxWidth: 560, margin: "2rem auto", padding: "0 1rem" }}>
      <IndicadorSincronizacao aoSincronizar={carregar} />

      <header>
        <h1>Minhas entregas</h1>
        <nav aria-label="Menu do motorista" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem 1.25rem", alignItems: "center", marginBottom: "1rem" }}>
          <Link to="/motorista/captura-bdo">
            <Icone nome="camera" /> Capturar BDO
          </Link>
          <Link to="/motorista/relatorio">
            <Icone nome="documento" /> Relatório quinzenal
          </Link>
          <Link to="/motorista/registros">
            <Icone nome="sincronizar" /> Registros do aparelho
          </Link>
          <Link to="/conta/senha">Minha senha</Link>
          <BotaoSair />
        </nav>
      </header>

      <PreferenciasAcessibilidade />

      <Ajuda>
        <p>Toque em uma entrega para ver os detalhes, calcular a rota e registrar o comprovante. Em “BDOs disponíveis”, toque em “Assumir” para incluir uma entrega na sua lista. Sem internet, o que você registrar fica salvo no aparelho e é enviado depois.</p>
      </Ajuda>

      {aviso && (
        <p
          role="status"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", border: "1px solid var(--confirmacao)", borderRadius: 6, padding: "0.5rem 0.75rem", color: "var(--confirmacao)" }}
        >
          <span>
            <Icone nome="checkCirculo" /> {aviso}
          </span>
          <button type="button" className="secundario" onClick={() => setAviso(null)} aria-label="Fechar aviso">
            Fechar
          </button>
        </p>
      )}

      {erro && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {erro}
        </p>
      )}

      {!painel && !erro && <p role="status">Carregando…</p>}

      {painel && (
        <>
          <p>
            <strong>{painel.contadorPendentes}</strong> entrega(s) pendente(s)
          </p>

          {painel.entregas.length === 0 ? (
            <p>Nenhuma entrega pendente no momento.</p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {painel.entregas.map((item) => (
                <li key={item.entregaId} style={{ marginBottom: "0.75rem" }}>
                  <Link to={`/motorista/entregas/${item.entregaId}`} className="cartao-link">
                    <strong>{item.bdoNumero ?? "BDO sem número"}</strong>
                    <div className="texto-apoio">{item.passageiroNome ?? "Passageiro não identificado"}</div>
                    <div className="texto-apoio">{item.endereco}</div>
                    {item.bagagensCarona.length > 0 && (
                      <div className="texto-apoio" style={{ color: "var(--acao)" }}>
                        + {item.bagagensCarona.length} bagagem(ns) carona
                      </div>
                    )}
                    {item.marcoMaisRecente && (
                      <div className="texto-apoio" style={{ marginTop: "0.25rem" }}>
                        <Icone nome={ROTULO_MARCO[item.marcoMaisRecente].icone} /> {ROTULO_MARCO[item.marcoMaisRecente].texto}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {bdosDisponiveis && <ListaBdosDisponiveis bdos={bdosDisponiveis.bdos} aoAutoatribuir={aoAutoatribuir} />}
        </>
      )}
    </main>
  );
}
