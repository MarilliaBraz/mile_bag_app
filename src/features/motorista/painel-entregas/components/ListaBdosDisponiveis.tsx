import { useState } from "react";
import { ApiError } from "../../../../shared/api/ApiError";
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
      await autoatribuir(bdoId);
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
    <section style={{ marginTop: "2rem" }}>
      <h2>BDOs disponíveis para assumir</h2>
      {erro && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {erro}
        </p>
      )}
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {bdos.map((bdo) => (
          <li
            key={bdo.bdoId}
            style={{
              border: "1px solid var(--borda)",
              borderRadius: 8,
              padding: "0.75rem 1rem",
              marginBottom: "0.75rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div>
              <strong>{bdo.bdoNumero ?? "BDO sem número"}</strong>
              <div style={{ fontSize: "0.9rem" }}>{bdo.passageiroNome ?? "Passageiro não identificado"}</div>
              <div style={{ fontSize: "0.85rem", color: "var(--texto)" }}>{bdo.endereco}</div>
              {bdo.origem === "EMAIL_AUTOMATICO" && (
                <span style={{ fontSize: "0.75rem", color: "var(--acao)" }}>Recebido por e-mail</span>
              )}
            </div>
            <button onClick={() => atribuir(bdo.bdoId)} disabled={atribuindo === bdo.bdoId}>
              {atribuindo === bdo.bdoId ? "Assumindo…" : "Assumir"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
