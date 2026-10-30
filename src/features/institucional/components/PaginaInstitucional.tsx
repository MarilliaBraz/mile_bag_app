import { Navigate } from "react-router-dom";
import { obterPapel, obterToken, rotaInicialDo, tokenExpirado } from "../../../shared/services/authStorage";
import "../institucional.css";
import { CabecalhoInstitucional } from "./CabecalhoInstitucional";
import { JornadaDaMala } from "./JornadaDaMala";
import { RodapeInstitucional } from "./RodapeInstitucional";
import { SecaoComoComecar } from "./SecaoComoComecar";
import { SecaoDiferenciais } from "./SecaoDiferenciais";
import { SecaoProblema } from "./SecaoProblema";
import { SecaoPublicos } from "./SecaoPublicos";
import { SecaoTopo } from "./SecaoTopo";

/**
 * Página inicial pública (HU38, RF31): apresenta o Milebag a empresas de entrega e companhias aéreas e leva ao pedido
 * de demonstração. Quem já tem sessão válida vai direto para a sua área.
 */
export function PaginaInstitucional() {
  const papel = obterPapel();
  if (obterToken() && !tokenExpirado() && papel) {
    return <Navigate to={rotaInicialDo(papel)} replace />;
  }

  return (
    <div className="inst">
      <CabecalhoInstitucional />
      <main>
        <SecaoTopo />
        <SecaoProblema />
        <JornadaDaMala />
        <SecaoPublicos />
        <SecaoDiferenciais />
        <SecaoComoComecar />
      </main>
      <RodapeInstitucional />
    </div>
  );
}
