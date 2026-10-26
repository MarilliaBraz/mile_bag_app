import { useState } from "react";
import { ApiError } from "../../../shared/api/ApiError";
import { useTextos } from "../../../shared/i18n/idioma";
import { Alerta } from "../../../shared/ui/Alerta";
import { registrarAjuste, type CampoAjuste } from "./relatorioService";

const CAMPOS: CampoAjuste[] = ["KM_IDA", "KM_VOLTA", "TARIFA_APLICADA", "VALOR_PEDAGIO"];

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
  const t = useTextos().motorista.relatorio;

  const valido = valorNovo.trim() !== "" && Number.isFinite(Number(valorNovo)) && justificativa.trim().length > 0;

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await registrarAjuste(viagemId, { campo, valorNovo: valorNovo.trim(), justificativa: justificativa.trim() });
      aoSalvar();
    } catch (excecao) {
      setErro(excecao instanceof ApiError ? excecao.message : t.falhaSalvar);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form
      onSubmit={salvar}
      className="nao-imprimir"
      style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--borda-suave)" }}
    >
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      <label htmlFor={`campo-${viagemId}`}>{t.oQueCorrigir}</label>
      <select id={`campo-${viagemId}`} value={campo} onChange={(e) => setCampo(e.target.value as CampoAjuste)}>
        {CAMPOS.map((valor) => (
          <option key={valor} value={valor}>
            {t.campos[valor]}
          </option>
        ))}
      </select>

      <div className="mt-3">
        <label htmlFor={`valor-${viagemId}`}>
          {t.valorCorreto}{" "}
          <span className="campo-obrigatorio" aria-hidden="true">
            *
          </span>
        </label>
        <input
          id={`valor-${viagemId}`}
          aria-required="true"
          type="number"
          step="any"
          min="0"
          value={valorNovo}
          onChange={(e) => setValorNovo(e.target.value)}
        />
      </div>

      <div className="mt-3">
        <label htmlFor={`just-${viagemId}`}>
          {t.justificativa}{" "}
          <span className="campo-obrigatorio" aria-hidden="true">
            *
          </span>
        </label>
        <textarea
          id={`just-${viagemId}`}
          aria-required="true"
          rows={2}
          value={justificativa}
          onChange={(e) => setJustificativa(e.target.value)}
          placeholder={t.porQueErrado}
        />
      </div>

      <div className="linha-acoes mt-3">
        <button type="submit" disabled={!valido || salvando}>
          {salvando ? t.salvando : t.salvarCorrecao}
        </button>
        <button type="button" className="secundario" onClick={aoCancelar} disabled={salvando}>
          {t.cancelar}
        </button>
      </div>
    </form>
  );
}
