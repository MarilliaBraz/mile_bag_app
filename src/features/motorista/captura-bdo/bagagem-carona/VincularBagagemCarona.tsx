import { useState } from "react";
import { ApiError } from "../../../../shared/api/ApiError";
import { executarOuEnfileirar } from "../../offline-sync/fila";
import { consultarBdosDisponiveis } from "../../painel-entregas/services/painelService";
import type { BagagemCaronaResumo, ItemBdoDisponivel } from "../../painel-entregas/types";
import { desvincularBagagemCarona, vincularBagagemCarona } from "./bagagemCaronaService";

/**
 * Vínculo de bagagens carona a uma entrega principal em andamento (HU05,
 * FR-001). Os candidatos são os mesmos BDOs confirmados sem motorista
 * responsável listados no painel (HU19) - uma bagagem carona é um BDO que
 * o motorista leva junto por estar no mesmo caminho.
 *
 * <p>O back-end recusa com `409` quando a entrega principal já foi
 * encerrada (FR-002) ou quando o BDO já está vinculado a outra entrega
 * (FR-003) - a mensagem do próprio back-end é exibida ao motorista.</p>
 */
export function VincularBagagemCarona({
  entregaId,
  bagagens,
  encerrada,
  aoAlterar,
}: {
  entregaId: string;
  bagagens: BagagemCaronaResumo[];
  encerrada: boolean;
  aoAlterar: () => void;
}) {
  const [candidatos, setCandidatos] = useState<ItemBdoDisponivel[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function abrirCandidatos() {
    setErro(null);
    setOcupado(true);
    try {
      const resposta = await consultarBdosDisponiveis();
      setCandidatos(resposta.bdos);
    } catch (excecao) {
      setErro(mensagem(excecao, "Não foi possível carregar os BDOs disponíveis."));
    } finally {
      setOcupado(false);
    }
  }

  async function vincular(bdoId: string) {
    setErro(null);
    setOcupado(true);
    try {
      // Offline (HU08, FR-001): o vínculo fica na fila e é efetivado na
      // sincronização - o desvínculo, por não ter evento equivalente no
      // contrato de sincronização, continua exigindo conexão.
      const { enfileirado } = await executarOuEnfileirar(() => vincularBagagemCarona(entregaId, bdoId), {
        tipoEvento: "BAGAGEM_CARONA_VINCULADA",
        payload: { entregaId, bdoId },
      });
      setCandidatos(null);
      if (enfileirado) {
        setErro("Vínculo salvo no aparelho e será enviado quando houver conexão.");
        return;
      }
      aoAlterar();
    } catch (excecao) {
      setErro(mensagem(excecao, "Não foi possível vincular esta bagagem carona."));
    } finally {
      setOcupado(false);
    }
  }

  async function desvincular(bagagemCaronaId: string) {
    setErro(null);
    setOcupado(true);
    try {
      await desvincularBagagemCarona(entregaId, bagagemCaronaId);
      aoAlterar();
    } catch (excecao) {
      setErro(mensagem(excecao, "Não foi possível remover este vínculo."));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h2>Bagagens carona</h2>

      {erro && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {erro}
        </p>
      )}

      {bagagens.length === 0 ? (
        <p style={{ fontSize: "0.9rem" }}>Nenhuma bagagem carona vinculada a esta entrega.</p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {bagagens.map((bagagem) => (
            <li key={bagagem.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
              <span>{bagagem.etiquetaBagagem ?? "Sem etiqueta"}</span>
              {!encerrada && (
                <button className="secundario" onClick={() => desvincular(bagagem.id)} disabled={ocupado}>
                  Desvincular
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* FR-002: entrega encerrada não aceita novo vínculo - o botão some,
          em vez de só falhar com 409 depois do toque. */}
      {!encerrada && candidatos === null && (
        <button onClick={abrirCandidatos} disabled={ocupado} style={{ marginTop: "0.5rem" }}>
          {ocupado ? "Carregando…" : "Vincular bagagem carona"}
        </button>
      )}

      {candidatos !== null && (
        <div style={{ marginTop: "0.75rem" }}>
          <h3>Escolha o BDO que vai junto</h3>
          {candidatos.length === 0 ? (
            <p style={{ fontSize: "0.9rem" }}>Nenhum BDO disponível para vincular no momento.</p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {candidatos.map((bdo) => (
                <li key={bdo.bdoId} style={{ marginBottom: "0.5rem" }}>
                  <button onClick={() => vincular(bdo.bdoId)} disabled={ocupado} className="secundario" style={{ width: "100%", textAlign: "left" }}>
                    <strong>{bdo.bdoNumero ?? "BDO sem número"}</strong> — {bdo.endereco ?? "endereço não informado"}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button className="secundario" onClick={() => setCandidatos(null)} disabled={ocupado}>
            Cancelar
          </button>
        </div>
      )}
    </section>
  );
}

function mensagem(excecao: unknown, padrao: string): string {
  return excecao instanceof ApiError ? excecao.message : padrao;
}
