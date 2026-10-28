import { useState } from "react";
import { ApiError } from "../../../../shared/services/ApiError";
import { Alerta } from "../../../../shared/components/Alerta";
import { AvisoContatoIncompleto } from "../../../../shared/components/AvisoContatoIncompleto";
import { AvisoJanelaReagendamento } from "../../../../shared/components/AvisoJanelaReagendamento";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Icone } from "../../../../shared/components/Icone";
import { executarOuEnfileirar } from "../../../../shared/services/fila";
import { autoatribuir } from "../services/painelService";
import type { ItemBdoDisponivel } from "../types";

/**
 * BDOs confirmados ainda sem motorista responsável (HU19, FR-007/FR-008) -
 * única via de descoberta de um BDO recebido automaticamente por e-mail
 * (RF21, HU02): sem esta lista, ele fica sem forma de o motorista o ver.
 */
export function ListaBdosDisponiveis({ bdos, aoAutoatribuir }: { bdos: ItemBdoDisponivel[]; aoAutoatribuir: (bdoId: string) => void }) {
  const [atribuindo, setAtribuindo] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const t = useTextos().motorista;

  async function atribuir(bdoId: string) {
    setErro(null);
    setAtribuindo(bdoId);
    try {
      // Offline, a atribuição fica na fila (HU08, FR-001) e o item sai da
      // lista do mesmo jeito - o servidor a efetiva na sincronização.
      await executarOuEnfileirar(() => autoatribuir(bdoId), {
        tipoEvento: "ENTREGA_AUTOATRIBUIDA",
        payload: { bdoId },
      });
      aoAutoatribuir(bdoId);
    } catch (excecao) {
      setErro(excecao instanceof ApiError ? excecao.message : t.disponiveis.falha);
    } finally {
      setAtribuindo(null);
    }
  }

  if (bdos.length === 0) {
    return null;
  }

  return (
    <section>
      <h2>{t.disponiveis.titulo(bdos.length)}</h2>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      <ul className="lista">
        {bdos.map((bdo) => (
          <li key={bdo.bdoId} className="cartao">
            <div className="cartao-cabecalho">
              <span className="codigo">{bdo.bdoNumero ?? t.geral.bdoSemNumero}</span>
              {bdo.reaberta ? (
                <span className="selo selo-aviso">
                  <Icone nome="sincronizar" /> {t.disponiveis.novaTentativa}
                </span>
              ) : (
                bdo.origem === "EMAIL_AUTOMATICO" && (
                  <span className="selo selo-info">
                    <Icone nome="email" /> {t.disponiveis.porEmail}
                  </span>
                )
              )}
            </div>
            <div className="destaque">{bdo.passageiroNome ?? t.geral.passageiroNaoIdentificado}</div>
            <div className="linha-icone texto-apoio">
              <Icone nome="pino" />
              <span>{bdo.endereco ?? t.geral.enderecoNaoInformado}</span>
            </div>
            <AvisoJanelaReagendamento janela={bdo.janelaReagendamento} />
            <AvisoContatoIncompleto pendencias={bdo.pendenciasContato} compacto />
            <button
              type="button"
              className="secundario bloco mt-3"
              onClick={() => atribuir(bdo.bdoId)}
              disabled={atribuindo === bdo.bdoId}
              aria-label={t.disponiveis.assumirRotulo(bdo.bdoNumero)}
            >
              {atribuindo === bdo.bdoId ? t.disponiveis.assumindo : t.disponiveis.assumir}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
