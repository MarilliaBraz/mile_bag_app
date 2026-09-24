import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../../../shared/api/ApiError";
import { IndicadorSincronizacao } from "../../offline-sync/IndicadorSincronizacao";
import { consultarBdosDisponiveis, consultarPainel } from "../services/painelService";
import type { BdosDisponiveis, ItemPainel, PainelEntregas as PainelEntregasResposta } from "../types";
import { ListaBdosDisponiveis } from "./ListaBdosDisponiveis";

const ROTULO_MARCO: Record<NonNullable<ItemPainel["marcoMaisRecente"]>, string> = {
  A_CAMINHO: "🚚 A caminho",
  CHEGADA: "📍 Chegou ao endereço",
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
  }, [carregar]);

  // FR-009: ao assumir um BDO, ele some da lista de disponíveis e a lista de
  // pendentes/contador precisam refletir a nova entrega - reconsulta o
  // painel inteiro em vez de tentar montar o item localmente.
  function aoAutoatribuir(bdoId: string) {
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

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1>Minhas entregas</h1>
        <Link to="/motorista/captura-bdo">Capturar BDO</Link>
      </div>

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
                  <Link
                    to={`/motorista/entregas/${item.entregaId}`}
                    style={{
                      display: "block",
                      border: "1px solid var(--borda)",
                      borderRadius: 8,
                      padding: "0.75rem 1rem",
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    <strong>{item.bdoNumero ?? "BDO sem número"}</strong>
                    <div style={{ fontSize: "0.9rem" }}>{item.passageiroNome ?? "Passageiro não identificado"}</div>
                    <div style={{ fontSize: "0.85rem" }}>{item.endereco}</div>
                    {item.bagagensCarona.length > 0 && (
                      <div style={{ fontSize: "0.8rem", color: "var(--acao)" }}>
                        + {item.bagagensCarona.length} bagagem(ns) carona
                      </div>
                    )}
                    {item.marcoMaisRecente && (
                      <div style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>{ROTULO_MARCO[item.marcoMaisRecente]}</div>
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
