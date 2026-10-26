import { useState } from "react";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { useTextos } from "../../../shared/i18n/idioma";
import { consultarIdentidadeVisual } from "../configuracao-tenant/identidadeVisualApi";
import { PreviaIdentidadeVisual } from "../configuracao-tenant/PreviaIdentidadeVisual";
import { baixarRelatorio, type Fechamento, type FechamentoDetalhe, type RelatorioPdf } from "./fechamentoApi";
import { Alerta } from "../../../shared/ui/Alerta";
import { Icone } from "../../../shared/ui/Icone";

const RELATORIOS: { tipo: RelatorioPdf; rotulo: "pagamentoEntregas" | "reembolsoPedagios" }[] = [
  { tipo: "relatorio-pagamento-entregas", rotulo: "pagamentoEntregas" },
  { tipo: "relatorio-reembolso-pedagios", rotulo: "reembolsoPedagios" },
];

/** Os dois PDFs do fechamento (pagamento e pedágio, sempre separados) com a prévia da identidade visual que eles vão usar (HU13). */
export function FechamentoRelatorioCard({ fechamento }: { fechamento: Fechamento | FechamentoDetalhe }) {
  const t = useTextos().backOffice.fechamentos;
  const { dados: identidade } = useRecurso(consultarIdentidadeVisual);
  const [baixando, setBaixando] = useState<RelatorioPdf | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function baixar(tipo: RelatorioPdf) {
    setErro(null);
    setBaixando(tipo);
    try {
      await baixarRelatorio(fechamento, tipo);
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaPdf));
    } finally {
      setBaixando(null);
    }
  }

  return (
    <div className="formulario">
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      <div className="linha-acoes">
        {RELATORIOS.map(({ tipo, rotulo }) => (
          <button
            key={tipo}
            type="button"
            className="secundario"
            disabled={baixando !== null}
            onClick={() => baixar(tipo)}
            aria-label={t.baixarPdf(t[rotulo])}
          >
            <Icone nome="baixar" /> {baixando === tipo ? t.gerando : t[rotulo]}
          </button>
        ))}
      </div>
      {identidade && (
        <details className="ajuda sem-icone m-0">
          <summary>{t.verCabecalho}</summary>
          <PreviaIdentidadeVisual identidade={identidade} />
        </details>
      )}
    </div>
  );
}
