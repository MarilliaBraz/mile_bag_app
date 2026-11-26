import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Tom = "aviso" | "erro" | "sucesso";

/**
 * Número do painel de atividades: com `para`, o cartão inteiro leva à tela onde a tarefa se resolve; com `aoClicar`,
 * abre a lista ali mesmo. O tom só aparece quando há algo a mostrar (valor maior que zero), para o vermelho continuar
 * significando urgência. `valor` pode ser texto já formatado (percentual, duração).
 */
export function CartaoIndicador({
  rotulo,
  valor,
  detalhe,
  tom,
  para,
  aoClicar,
}: {
  rotulo: string;
  valor: number | string | null;
  detalhe?: ReactNode;
  tom?: Tom;
  para?: string;
  aoClicar?: () => void;
}) {
  const comTom = tom && (typeof valor === "string" || (valor ?? 0) > 0);
  const clicavel = para || aoClicar;
  const classe = `indicador${comTom ? ` indicador-${tom}` : ""}${clicavel ? " indicador-link" : ""}`;
  const conteudo = (
    <>
      <span className="indicador-rotulo">{rotulo}</span>
      <span className="indicador-valor">{valor ?? "–"}</span>
      {detalhe && <span className="texto-apoio">{detalhe}</span>}
    </>
  );
  if (aoClicar) {
    return (
      <button type="button" className={classe} onClick={aoClicar}>
        {conteudo}
      </button>
    );
  }
  return para ? (
    <Link to={para} className={classe}>
      {conteudo}
    </Link>
  ) : (
    <div className={classe}>{conteudo}</div>
  );
}
