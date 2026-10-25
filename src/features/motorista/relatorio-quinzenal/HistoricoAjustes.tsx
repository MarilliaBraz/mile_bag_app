import { useEffect, useState } from "react";
import { formatarMoeda } from "../../../shared/format/formatar";
import { Alerta, Carregando } from "../../../shared/ui/Alerta";
import { ROTULO_CAMPO } from "./AjusteForm";
import { listarAjustes, type Ajuste, type CampoAjuste } from "./relatorioService";

const KM = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// O back-end guarda os valores como texto cru ("4.014"); na tela eles seguem
// o mesmo formato do relatório (km com duas casas, valores em reais).
function formatarValor(campo: CampoAjuste, valor: string): string {
  const numero = Number(valor);
  if (valor.trim() === "" || !Number.isFinite(numero)) {
    return valor;
  }
  return campo === "KM_IDA" || campo === "KM_VOLTA" ? `${KM.format(numero)} km` : formatarMoeda(numero);
}

/**
 * Histórico completo de correções de uma viagem (HU17, FR-005) - nada é
 * sobrescrito, então o valor original de cada campo continua visível: é o
 * `valorAnterior` da correção mais antiga daquele campo.
 */
export function HistoricoAjustes({ viagemId }: { viagemId: string }) {
  const [ajustes, setAjustes] = useState<Ajuste[] | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    listarAjustes(viagemId)
      .then(setAjustes)
      .catch(() => setErro(true));
  }, [viagemId]);

  if (erro) {
    return <Alerta tipo="erro">Não foi possível carregar o histórico.</Alerta>;
  }
  if (!ajustes) {
    return <Carregando texto="Carregando histórico…" />;
  }

  // A lista vem da mais recente para a mais antiga: o último de cada campo
  // (o mais antigo) é o que traz o valor original.
  const originalPorCampo = new Map<CampoAjuste, string>();
  for (const ajuste of ajustes) {
    originalPorCampo.set(ajuste.campo, ajuste.valorAnterior);
  }

  return (
    <div className="nao-imprimir texto-apoio" style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--borda-suave)" }}>
      <strong>Valor original preservado</strong>
      <ul>
        {[...originalPorCampo].map(([campo, original]) => (
          <li key={campo}>
            {ROTULO_CAMPO[campo]}: {formatarValor(campo, original)}
          </li>
        ))}
      </ul>
      <strong>Correções ({ajustes.length})</strong>
      <ul>
        {ajustes.map((ajuste) => (
          <li key={ajuste.id}>
            {new Date(ajuste.criadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })} · {ROTULO_CAMPO[ajuste.campo]}:{" "}
            {formatarValor(ajuste.campo, ajuste.valorAnterior)} → <strong>{formatarValor(ajuste.campo, ajuste.valorNovo)}</strong>
            <br />
            <em>{ajuste.justificativa}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}
