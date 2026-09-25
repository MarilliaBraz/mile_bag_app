import { Ajuda } from "../../../shared/ui/Ajuda";
import { SecaoCamposBaixa } from "./SecaoCamposBaixa";
import { SecaoCodigoNome } from "./SecaoCodigoNome";
import { SecaoMotivos } from "./SecaoMotivos";
import { SecaoPeriodicidade } from "./SecaoPeriodicidade";

/** Configurações da empresa (HU11): cinco categorias independentes, cada uma salva por conta própria. */
export function TelaConfiguracoes() {
  return (
    <main style={{ display: "grid", gap: "2rem" }}>
      <h1 style={{ marginBottom: 0 }}>Configurações</h1>
      <Ajuda>
        <p>Ajuste como a sua empresa opera: código e nome, periodicidade do fechamento, motivos de ocorrência e campos exigidos na baixa da entrega. As mudanças valem para os próximos registros.</p>
      </Ajuda>
      <SecaoMotivos />
      <SecaoCamposBaixa />
      <SecaoCodigoNome categoria="bases-aeroportuarias" titulo="Bases aeroportuárias" rotuloCodigo="Código IATA" />
      <SecaoCodigoNome categoria="companhias-aereas" titulo="Companhias aéreas atendidas" rotuloCodigo="Código IATA" />
      <SecaoPeriodicidade />
    </main>
  );
}
