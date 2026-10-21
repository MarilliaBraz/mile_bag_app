import { Icone } from "../../../../shared/ui/Icone";
import { useState } from "react";
import { ApiError } from "../../../../shared/api/ApiError";
import { Alerta } from "../../../../shared/ui/Alerta";
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
  const [aviso, setAviso] = useState<string | null>(null);
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
    setAviso(null);
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
        setAviso("Vínculo salvo no aparelho e será enviado quando houver conexão.");
        return;
      }
      setAviso("Bagagem carona vinculada.");
      aoAlterar();
    } catch (excecao) {
      setErro(mensagem(excecao, "Não foi possível vincular esta bagagem carona."));
    } finally {
      setOcupado(false);
    }
  }

  async function desvincular(bagagemCaronaId: string) {
    setErro(null);
    setAviso(null);
    setOcupado(true);
    try {
      await desvincularBagagemCarona(entregaId, bagagemCaronaId);
      setAviso("Vínculo removido.");
      aoAlterar();
    } catch (excecao) {
      setErro(mensagem(excecao, "Não foi possível remover este vínculo."));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <section>
      <h2>
        <Icone nome="mala" /> Bagagens carona
      </h2>

      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {aviso && <Alerta tipo="sucesso">{aviso}</Alerta>}

      <div className="cartao">
        {bagagens.length === 0 ? (
          <p className="texto-apoio">Nenhuma bagagem carona vinculada a esta entrega.</p>
        ) : (
          <ul className="lista" style={{ gap: "0.5rem" }}>
            {bagagens.map((bagagem) => (
              <li key={bagagem.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                <span className="codigo">{bagagem.etiquetaBagagem ?? "Sem etiqueta"}</span>
                {!encerrada && (
                  <button type="button" className="fantasma" onClick={() => desvincular(bagagem.id)} disabled={ocupado} aria-label={`Desvincular bagagem ${bagagem.etiquetaBagagem ?? "sem etiqueta"}`}>
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
          <button type="button" className="secundario bloco mt-3" onClick={abrirCandidatos} disabled={ocupado}>
            {ocupado ? "Carregando…" : "+ Levar outra bagagem junto"}
          </button>
        )}

        {candidatos !== null && (
          <div className="mt-3">
            <h3>Escolha o BDO que vai junto</h3>
            {candidatos.length === 0 ? (
              <p className="texto-apoio">Nenhum BDO disponível para vincular no momento.</p>
            ) : (
              <ul className="lista" style={{ gap: "0.5rem" }}>
                {candidatos.map((bdo) => (
                  <li key={bdo.bdoId}>
                    <button type="button" onClick={() => vincular(bdo.bdoId)} disabled={ocupado} className="opcao">
                      <span>
                        <span className="codigo">{bdo.bdoNumero ?? "BDO sem número"}</span>
                        <span className="texto-apoio em-bloco">
                          {bdo.endereco ?? "endereço não informado"}
                        </span>
                      </span>
                      <Icone nome="chevron" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button type="button" className="fantasma bloco mt-2" onClick={() => setCandidatos(null)} disabled={ocupado}>
              Cancelar
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function mensagem(excecao: unknown, padrao: string): string {
  return excecao instanceof ApiError ? excecao.message : padrao;
}
