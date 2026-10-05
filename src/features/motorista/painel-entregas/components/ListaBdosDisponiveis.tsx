import { useState } from "react";
import { ApiError } from "../../../../shared/api/ApiError";
import { Alerta } from "../../../../shared/ui/Alerta";
import { Icone } from "../../../../shared/ui/Icone";
import { executarOuEnfileirar } from "../../offline-sync/fila";
import { autoatribuir } from "../services/painelService";
import type { ItemBdoDisponivel } from "../types";

/**
 * BDOs confirmados ainda sem motorista responsável (HU19, FR-007/FR-008) -
 * única via de descoberta de um BDO recebido automaticamente por e-mail
 * (RF21, HU02): sem esta lista, ele fica sem forma de o motorista o ver.
 */
export function ListaBdosDisponiveis({
  bdos,
  aoAutoatribuir,
}: {
  bdos: ItemBdoDisponivel[];
  aoAutoatribuir: (bdoId: string) => void;
}) {
  const [atribuindo, setAtribuindo] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

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
      setErro(excecao instanceof ApiError ? excecao.message : "Não foi possível assumir esta entrega. Tente novamente.");
    } finally {
      setAtribuindo(null);
    }
  }

  if (bdos.length === 0) {
    return null;
  }

  return (
    <section>
      <h2>Disponíveis para assumir ({bdos.length})</h2>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      <ul className="lista">
        {bdos.map((bdo) => (
          <li key={bdo.bdoId} className="cartao">
            <div className="cartao-cabecalho">
              <span className="codigo">{bdo.bdoNumero ?? "BDO sem número"}</span>
              {bdo.origem === "EMAIL_AUTOMATICO" && (
                <span className="selo selo-info">
                  <Icone nome="email" /> Por e-mail
                </span>
              )}
            </div>
            <div className="destaque">{bdo.passageiroNome ?? "Passageiro não identificado"}</div>
            <div className="linha-icone texto-apoio">
              <Icone nome="pino" />
              <span>{bdo.endereco ?? "Endereço não informado"}</span>
            </div>
            <button
              type="button"
              className="secundario bloco"
              style={{ marginTop: "0.75rem" }}
              onClick={() => atribuir(bdo.bdoId)}
              disabled={atribuindo === bdo.bdoId}
              aria-label={`Assumir BDO ${bdo.bdoNumero ?? "sem número"}`}
            >
              {atribuindo === bdo.bdoId ? "Assumindo…" : "Assumir entrega"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
