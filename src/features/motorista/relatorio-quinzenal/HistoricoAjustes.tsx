import { useEffect, useState } from "react";
import { formatarDataHora, formatarMoeda, formatarNumero } from "../../../shared/format/formatar";
import { useTextos } from "../../../shared/i18n/idioma";
import { Alerta, Carregando } from "../../../shared/ui/Alerta";
import { listarAjustes, type Ajuste, type CampoAjuste } from "./relatorioService";

// O back-end guarda os valores como texto cru ("4.014"); na tela eles seguem
// o mesmo formato do relatório (km com duas casas, valores em reais).
function formatarValor(campo: CampoAjuste, valor: string): string {
  const numero = Number(valor);
  if (valor.trim() === "" || !Number.isFinite(numero)) {
    return valor;
  }
  return campo === "KM_IDA" || campo === "KM_VOLTA" ? `${formatarNumero(numero, 2)} km` : formatarMoeda(numero);
}

/**
 * Histórico completo de correções de uma viagem (HU17, FR-005) - nada é
 * sobrescrito, então o valor original de cada campo continua visível: é o
 * `valorAnterior` da correção mais antiga daquele campo.
 */
export function HistoricoAjustes({ viagemId }: { viagemId: string }) {
  const [ajustes, setAjustes] = useState<Ajuste[] | null>(null);
  const [erro, setErro] = useState(false);
  const t = useTextos().motorista.relatorio;

  useEffect(() => {
    listarAjustes(viagemId)
      .then(setAjustes)
      .catch(() => setErro(true));
  }, [viagemId]);

  if (erro) {
    return <Alerta tipo="erro">{t.falhaHistorico}</Alerta>;
  }
  if (!ajustes) {
    return <Carregando texto={t.carregandoHistorico} />;
  }

  // A lista vem da mais recente para a mais antiga: o último de cada campo
  // (o mais antigo) é o que traz o valor original.
  const originalPorCampo = new Map<CampoAjuste, string>();
  for (const ajuste of ajustes) {
    originalPorCampo.set(ajuste.campo, ajuste.valorAnterior);
  }

  return (
    <div
      className="nao-imprimir texto-apoio"
      style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--borda-suave)" }}
    >
      <strong>{t.valorOriginal}</strong>
      <ul>
        {[...originalPorCampo].map(([campo, original]) => (
          <li key={campo}>
            {t.campos[campo]}: {formatarValor(campo, original)}
          </li>
        ))}
      </ul>
      <strong>{t.correcoes(ajustes.length)}</strong>
      <ul>
        {ajustes.map((ajuste) => (
          <li key={ajuste.id}>
            {formatarDataHora(ajuste.criadoEm)} · {t.campos[ajuste.campo]}: {formatarValor(ajuste.campo, ajuste.valorAnterior)} →{" "}
            <strong>{formatarValor(ajuste.campo, ajuste.valorNovo)}</strong>
            <br />
            <em>{ajuste.justificativa}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}
