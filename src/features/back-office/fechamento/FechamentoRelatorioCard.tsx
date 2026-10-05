import { useState } from "react";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { consultarIdentidadeVisual } from "../configuracao-tenant/identidadeVisualApi";
import { PreviaIdentidadeVisual } from "../configuracao-tenant/PreviaIdentidadeVisual";
import { baixarRelatorio, type Fechamento, type FechamentoDetalhe, type RelatorioPdf } from "./fechamentoApi";
import { Alerta } from "../../../shared/ui/Alerta";
import { Icone } from "../../../shared/ui/Icone";

const RELATORIOS: { tipo: RelatorioPdf; rotulo: string }[] = [
  { tipo: "relatorio-pagamento-entregas", rotulo: "Pagamento de entregas" },
  { tipo: "relatorio-reembolso-pedagios", rotulo: "Reembolso de pedágios" },
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
    <div className="formulario">
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      <div className="linha-acoes">
        {RELATORIOS.map(({ tipo, rotulo }) => (
          <button key={tipo} type="button" className="secundario" disabled={baixando !== null} onClick={() => baixar(tipo)} aria-label={`Baixar PDF de ${rotulo.toLowerCase()}`}>
            <Icone nome="baixar" /> {baixando === tipo ? "Gerando…" : rotulo}
          </button>
        ))}
      </div>
      {identidade && (
        <details className="ajuda sem-icone" style={{ margin: 0 }}>
          <summary>Ver cabeçalho que vai nos PDFs</summary>
          <PreviaIdentidadeVisual identidade={identidade} />
        </details>
      )}
    </div>
  );
}
