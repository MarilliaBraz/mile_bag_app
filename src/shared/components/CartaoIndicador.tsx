import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Tom = "aviso" | "erro";

/**
 * Número do painel de atividades: com `para`, o cartão inteiro leva à tela onde a tarefa se resolve. O tom só aparece
 * quando há algo a fazer (valor maior que zero), para o vermelho continuar significando urgência.
 */
export function CartaoIndicador({
  rotulo,
  valor,
  detalhe,
  tom,
  para,
}: {
  rotulo: string;
  valor: number | null;
  detalhe?: ReactNode;
  tom?: Tom;
  para?: string;
}) {
  const classe = `indicador${tom && valor ? ` indicador-${tom}` : ""}${para ? " indicador-link" : ""}`;
  const conteudo = (
    <>
      <span className="indicador-rotulo">{rotulo}</span>
      <span className="indicador-valor">{valor ?? "–"}</span>
      {detalhe && <span className="texto-apoio">{detalhe}</span>}
    </>
  );
  return para ? (
    <Link to={para} className={classe}>
      {conteudo}
    </Link>
  ) : (
    <div className={classe}>{conteudo}</div>
  );
}
