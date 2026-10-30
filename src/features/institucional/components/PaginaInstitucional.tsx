import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { obterPapel, obterToken, rotaInicialDo, tokenExpirado } from "../../../shared/services/authStorage";
import "../institucional.css";
import { CabecalhoInstitucional } from "./CabecalhoInstitucional";
import { JornadaDaMala } from "./JornadaDaMala";
import { RodapeInstitucional } from "./RodapeInstitucional";
import { SecaoComoComecar } from "./SecaoComoComecar";
import { SecaoDemonstracao } from "./SecaoDemonstracao";
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
  const logado = Boolean(obterToken() && !tokenExpirado() && papel);
  const { hash } = useLocation();

  // A página chega num pedaço carregado depois: um link com âncora (/#demonstracao) só acha a seção agora.
  useEffect(() => {
    if (!logado && hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    }
  }, [hash, logado]);

  if (logado) {
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
        <SecaoDemonstracao />
      </main>
      <RodapeInstitucional />
    </div>
  );
}
