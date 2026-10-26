import { Icone } from "../../../../shared/ui/Icone";
import { useState } from "react";
import { ApiError } from "../../../../shared/api/ApiError";
import { useTextos } from "../../../../shared/i18n/idioma";
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
  const t = useTextos().motorista;

  async function abrirCandidatos() {
    setErro(null);
    setOcupado(true);
    try {
      const resposta = await consultarBdosDisponiveis();
      setCandidatos(resposta.bdos);
    } catch (excecao) {
      setErro(mensagem(excecao, t.bagagem.falhaCarregar));
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
        setAviso(t.bagagem.vinculoNaFila);
        return;
      }
      setAviso(t.bagagem.vinculada);
      aoAlterar();
    } catch (excecao) {
      setErro(mensagem(excecao, t.bagagem.falhaVincular));
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
      setAviso(t.bagagem.vinculoRemovido);
      aoAlterar();
    } catch (excecao) {
      setErro(mensagem(excecao, t.bagagem.falhaRemover));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <section>
      <h2>
        <Icone nome="mala" /> {t.bagagem.titulo}
      </h2>

      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {aviso && <Alerta tipo="sucesso">{aviso}</Alerta>}

      <div className="cartao">
        {bagagens.length === 0 ? (
          <p className="texto-apoio">{t.bagagem.nenhuma}</p>
        ) : (
          <ul className="lista" style={{ gap: "0.5rem" }}>
            {bagagens.map((bagagem) => (
              <li key={bagagem.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                <span className="codigo">{bagagem.etiquetaBagagem ?? t.bagagem.semEtiqueta}</span>
                {!encerrada && (
                  <button
                    type="button"
                    className="fantasma"
                    onClick={() => desvincular(bagagem.id)}
                    disabled={ocupado}
                    aria-label={t.bagagem.desvincularRotulo(bagagem.etiquetaBagagem)}
                  >
                    {t.bagagem.desvincular}
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
            {ocupado ? t.bagagem.carregando : t.bagagem.levarOutra}
          </button>
        )}

        {candidatos !== null && (
          <div className="mt-3">
            <h3>{t.bagagem.escolhaBdo}</h3>
            {candidatos.length === 0 ? (
              <p className="texto-apoio">{t.bagagem.nenhumBdo}</p>
            ) : (
              <ul className="lista" style={{ gap: "0.5rem" }}>
                {candidatos.map((bdo) => (
                  <li key={bdo.bdoId}>
                    <button type="button" onClick={() => vincular(bdo.bdoId)} disabled={ocupado} className="opcao">
                      <span>
                        <span className="codigo">{bdo.bdoNumero ?? t.geral.bdoSemNumero}</span>
                        <span className="texto-apoio em-bloco">{bdo.endereco ?? t.bagagem.enderecoNaoInformado}</span>
                      </span>
                      <Icone nome="chevron" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button type="button" className="fantasma bloco mt-2" onClick={() => setCandidatos(null)} disabled={ocupado}>
              {t.bagagem.cancelar}
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
