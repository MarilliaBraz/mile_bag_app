import { Link } from "react-router-dom";
import { formatarDataHora } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import type { ItemMala } from "../types";

const LIMITE_API = 100;

/** Lista aberta a partir de um número do painel: cada mala leva à tela de Entregas já filtrada pelo número do BDO. */
export function ListaMalas({ itens, mostrar }: { itens: ItemMala[]; mostrar: "prazo" | "referencia" }) {
  const t = useTextos().backOffice.painel;
  if (itens.length === 0) {
    return <p className="texto-apoio">{t.listaVazia}</p>;
  }
  return (
    <>
      <ul className="lista-malas">
        {itens.map((item) => {
          const quando = mostrar === "prazo" ? item.prazo : item.referencia;
          const numero = item.numero ?? "–";
          return (
            <li key={item.bdoId}>
              <Link to={`/admin/entregas?busca=${encodeURIComponent(item.numero ?? "")}`} aria-label={t.abrirEntrega(numero)}>
                <span className="linha-mala">
                  <strong className="codigo">{numero}</strong>
                  {quando && (
                    <span className="texto-apoio">
                      {mostrar === "prazo" ? t.prazoEm(formatarDataHora(quando)) : t.referenciaEm(formatarDataHora(quando))}
                    </span>
                  )}
                </span>
                <span className="texto-apoio">{[item.passageiro, item.base, item.motorista].filter(Boolean).join(" · ")}</span>
                {item.detalhe && <span>{t.detalhes[item.detalhe] ?? item.detalhe}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
      {itens.length >= LIMITE_API && <p className="texto-apoio">{t.listaLimite}</p>}
    </>
  );
}
