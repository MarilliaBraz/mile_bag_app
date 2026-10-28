import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Pagina } from "../../../../shared/components/Pagina";
import { SecaoCamposBaixa } from "./SecaoCamposBaixa";
import { SecaoCodigoNome } from "./SecaoCodigoNome";
import { SecaoMotivos } from "./SecaoMotivos";
import { SecaoPeriodicidade } from "./SecaoPeriodicidade";

/** Configurações da empresa (HU11): cinco categorias independentes, cada uma salva por conta própria. */
export function TelaConfiguracoes() {
  const t = useTextos().backOffice.configuracoes;
  return (
    <Pagina titulo={t.titulo} descricao={t.descricao}>
      <div className="grade-paineis">
        <SecaoMotivos />
        <SecaoCamposBaixa />
        <SecaoCodigoNome categoria="bases-aeroportuarias" titulo={t.basesAeroportuarias} rotuloCodigo={t.codigoIata} />
        <SecaoCodigoNome categoria="companhias-aereas" titulo={t.companhiasAtendidas} rotuloCodigo={t.codigoIata} />
        <SecaoPeriodicidade />
      </div>
    </Pagina>
  );
}
