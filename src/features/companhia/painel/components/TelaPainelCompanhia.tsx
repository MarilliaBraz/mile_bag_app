import { Pagina } from "../../../../shared/components/Pagina";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { IndicadoresCompanhia } from "./IndicadoresCompanhia";

/** Início do administrador da companhia aérea (item 5). */
export function TelaPainelCompanhia() {
  const t = useTextos().backOffice.painel;
  return (
    <Pagina titulo={t.titulo} descricao={t.descricaoCompanhia}>
      <IndicadoresCompanhia rascunhosPara="/companhia/bagagens?situacao=RASCUNHO" />
    </Pagina>
  );
}
