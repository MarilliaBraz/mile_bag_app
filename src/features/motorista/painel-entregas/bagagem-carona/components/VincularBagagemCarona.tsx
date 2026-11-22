import { Icone } from "../../../../../shared/components/Icone";
import { useEffect, useState } from "react";
import { ApiError } from "../../../../../shared/services/ApiError";
import { useTextos } from "../../../../../shared/utils/i18n/idioma";
import { Alerta } from "../../../../../shared/components/Alerta";
import { executarOuEnfileirar } from "../../../../../shared/services/fila";
import { consultarBdosDisponiveis } from "../../services/painelService";
import type { BagagemCaronaResumo, ItemBdoDisponivel } from "../../types";
import { consultarSugestoesCarona, desvincularBagagemCarona, vincularBagagemCarona } from "../services/bagagemCaronaService";

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
  // Item 8: BDOs disponíveis do mesmo endereço, sugeridos como carona (o motorista confirma).
  const [sugestoes, setSugestoes] = useState<ItemBdoDisponivel[]>([]);
  const t = useTextos().motorista;

  useEffect(() => {
    if (encerrada) {
      return;
    }
    let ativo = true;
    consultarSugestoesCarona(entregaId)
      .then((lista) => ativo && setSugestoes(lista))
      // Sem internet, só não sugere: a lista completa continua disponível.
      .catch(() => ativo && setSugestoes([]));
    return () => {
      ativo = false;
    };
    // bagagens: depois de vincular, a sugestão já levada sai da lista.
  }, [entregaId, encerrada, bagagens.length]);

  const idsSugeridos = new Set(sugestoes.map((bdo) => bdo.bdoId));
  // Na lista completa, os do mesmo endereço vêm primeiro.
  const candidatosOrdenados =
    candidatos === null
      ? null
      : [...candidatos.filter((bdo) => idsSugeridos.has(bdo.bdoId)), ...candidatos.filter((bdo) => !idsSugeridos.has(bdo.bdoId))];

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
      setSugestoes((atuais) => atuais.filter((bdo) => bdo.bdoId !== bdoId));
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

      {!encerrada && sugestoes.length > 0 && (
        <Alerta tipo="aviso">
          <p>
            <strong>{t.sugestaoCarona.titulo(sugestoes.length)}</strong>
          </p>
          <p>{t.sugestaoCarona.explicacao}</p>
          <ul className="lista" style={{ gap: "0.5rem" }}>
            {sugestoes.map((bdo) => (
              <li key={bdo.bdoId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                <span>
                  <span className="codigo">{bdo.bdoNumero ?? t.geral.bdoSemNumero}</span>
                  <span className="texto-apoio em-bloco">{t.malas.quantidade(bdo.quantidadeMalas)}</span>
                </span>
                <button type="button" className="secundario" onClick={() => vincular(bdo.bdoId)} disabled={ocupado}>
                  {t.sugestaoCarona.levar}
                </button>
              </li>
            ))}
          </ul>
        </Alerta>
      )}

      <div className="cartao">
        {bagagens.length === 0 ? (
          <p className="texto-apoio">{t.bagagem.nenhuma}</p>
        ) : (
          <ul className="lista" style={{ gap: "0.5rem" }}>
            {bagagens.map((bagagem) => (
              <li key={bagagem.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                <span>
                  <span className="codigo">{bagagem.bdoNumero ?? bagagem.etiquetaBagagem ?? t.bagagem.semEtiqueta}</span>
                  <span className="texto-apoio em-bloco">{t.malas.quantidade(bagagem.quantidadeMalas)}</span>
                </span>
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
            {candidatosOrdenados === null || candidatosOrdenados.length === 0 ? (
              <p className="texto-apoio">{t.bagagem.nenhumBdo}</p>
            ) : (
              <ul className="lista" style={{ gap: "0.5rem" }}>
                {candidatosOrdenados.map((bdo) => (
                  <li key={bdo.bdoId}>
                    <button type="button" onClick={() => vincular(bdo.bdoId)} disabled={ocupado} className="opcao">
                      <span>
                        <span className="codigo">{bdo.bdoNumero ?? t.geral.bdoSemNumero}</span>
                        {idsSugeridos.has(bdo.bdoId) && <span className="selo selo-sucesso">{t.sugestaoCarona.mesmoEndereco}</span>}
                        <span className="texto-apoio em-bloco">{bdo.endereco ?? t.bagagem.enderecoNaoInformado}</span>
                        <span className="texto-apoio em-bloco">{t.malas.quantidade(bdo.quantidadeMalas)}</span>
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
