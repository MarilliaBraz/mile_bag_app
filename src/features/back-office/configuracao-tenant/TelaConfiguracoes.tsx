import { Pagina } from "../layout/Pagina";
import { SecaoCamposBaixa } from "./SecaoCamposBaixa";
import { SecaoCodigoNome } from "./SecaoCodigoNome";
import { SecaoMotivos } from "./SecaoMotivos";
import { SecaoPeriodicidade } from "./SecaoPeriodicidade";

/** Configurações da empresa (HU11): cinco categorias independentes, cada uma salva por conta própria. */
export function TelaConfiguracoes() {
  return (
    <Pagina
      titulo="Configurações"
      descricao="Como a sua empresa opera. Cada bloco é salvo separadamente, e as mudanças valem para os próximos registros."
    >
      <div className="grade-paineis">
        <SecaoMotivos />
        <SecaoCamposBaixa />
        <SecaoCodigoNome categoria="bases-aeroportuarias" titulo="Bases aeroportuárias" rotuloCodigo="Código IATA" />
        <SecaoCodigoNome categoria="companhias-aereas" titulo="Companhias aéreas atendidas" rotuloCodigo="Código IATA" />
        <SecaoPeriodicidade />
      </div>
    </Pagina>
  );
}
