import { useState } from "react";
import { ApiError } from "../../../shared/api/ApiError";
import { registrarAjuste, type CampoAjuste } from "./relatorioService";

export const ROTULO_CAMPO: Record<CampoAjuste, string> = {
  KM_IDA: "Quilometragem de ida",
  KM_VOLTA: "Quilometragem de volta",
  TARIFA_APLICADA: "Tarifa aplicada (R$)",
  VALOR_PEDAGIO: "Pedágio (R$)",
};

/**
 * Correção de um valor calculado (HU17, FR-003/FR-004). O botão de salvar
 * fica bloqueado enquanto a justificativa está vazia - o back-end também
 * recusa (400), mas o motorista não deveria precisar chegar lá para
 * descobrir. A correção nunca apaga o valor original: vira um novo
 * registro no histórico (RD13), inclusive uma reversão.
 */
export function AjusteForm({ viagemId, aoSalvar, aoCancelar }: { viagemId: string; aoSalvar: () => void; aoCancelar: () => void }) {
  const [campo, setCampo] = useState<CampoAjuste>("KM_IDA");
  const [valorNovo, setValorNovo] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const valido = valorNovo.trim() !== "" && Number.isFinite(Number(valorNovo)) && justificativa.trim().length > 0;

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await registrarAjuste(viagemId, { campo, valorNovo: valorNovo.trim(), justificativa: justificativa.trim() });
      aoSalvar();
    } catch (excecao) {
      setErro(excecao instanceof ApiError ? excecao.message : "Não foi possível salvar a correção.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={salvar} className="nao-imprimir" style={{ margin: "0.5rem 0 1rem", padding: "0.75rem", border: "1px solid var(--borda)", borderRadius: 8 }}>
      {erro && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {erro}
        </p>
      )}
      <label htmlFor={`campo-${viagemId}`}>O que corrigir</label>
      <select id={`campo-${viagemId}`} value={campo} onChange={(e) => setCampo(e.target.value as CampoAjuste)}>
        {Object.entries(ROTULO_CAMPO).map(([valor, rotulo]) => (
          <option key={valor} value={valor}>
            {rotulo}
          </option>
        ))}
      </select>

      <div style={{ marginTop: "0.75rem" }}>
        <label htmlFor={`valor-${viagemId}`}>Valor correto *</label>
        <input id={`valor-${viagemId}`} type="number" step="any" min="0" value={valorNovo} onChange={(e) => setValorNovo(e.target.value)} />
      </div>

      <div style={{ marginTop: "0.75rem" }}>
        <label htmlFor={`just-${viagemId}`}>Justificativa *</label>
        <textarea id={`just-${viagemId}`} rows={2} value={justificativa} onChange={(e) => setJustificativa(e.target.value)} placeholder="Por que este valor está errado?" />
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
        <button type="submit" disabled={!valido || salvando}>
          {salvando ? "Salvando…" : "Salvar correção"}
        </button>
        <button type="button" className="secundario" onClick={aoCancelar} disabled={salvando}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
