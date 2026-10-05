import { useState } from "react";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { consultarIdentidadeVisual } from "../configuracao-tenant/identidadeVisualApi";
import { PreviaIdentidadeVisual } from "../configuracao-tenant/PreviaIdentidadeVisual";
import { baixarRelatorio, type Fechamento, type FechamentoDetalhe, type RelatorioPdf } from "./fechamentoApi";
import { Alerta } from "../../../shared/ui/Alerta";

const RELATORIOS: { tipo: RelatorioPdf; rotulo: string }[] = [
  { tipo: "relatorio-pagamento-entregas", rotulo: "Baixar pagamento de entregas (PDF)" },
  { tipo: "relatorio-reembolso-pedagios", rotulo: "Baixar reembolso de pedágios (PDF)" },
];

/** Os dois PDFs do fechamento (pagamento e pedágio, sempre separados) com a prévia da identidade visual que eles vão usar (HU13). */
export function FechamentoRelatorioCard({ fechamento }: { fechamento: Fechamento | FechamentoDetalhe }) {
  const { dados: identidade } = useRecurso(consultarIdentidadeVisual, "Não foi possível carregar a identidade visual.");
  const [baixando, setBaixando] = useState<RelatorioPdf | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function baixar(tipo: RelatorioPdf) {
    setErro(null);
    setBaixando(tipo);
    try {
      await baixarRelatorio(fechamento, tipo);
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, "Não foi possível gerar o PDF."));
    } finally {
      setBaixando(null);
    }
  }

  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {erro && (
        <Alerta tipo="erro">
          {erro}
        </Alerta>
      )}
      {identidade && <PreviaIdentidadeVisual identidade={identidade} />}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {RELATORIOS.map(({ tipo, rotulo }) => (
          <button key={tipo} type="button" className="secundario" disabled={baixando !== null} onClick={() => baixar(tipo)}>
            {baixando === tipo ? "Gerando…" : rotulo}
          </button>
        ))}
      </div>
    </div>
  );
}
