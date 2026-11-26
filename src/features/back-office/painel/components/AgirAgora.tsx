import { Link } from "react-router-dom";
import { Painel } from "../../../../shared/components/Pagina";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import type { ItemAgir } from "../utils/cockpit";
import { formatarDuracao } from "../utils/formatarPainel";

const VISIVEIS = 8;

/** As malas mais urgentes de todas as exceções, cada uma com o motivo e o link para resolver. */
export function AgirAgora({ itens }: { itens: ItemAgir[] }) {
  const t = useTextos().backOffice.painel;
  const tempo = (item: ItemAgir) => {
    if (item.minutos === null) return null;
    if (item.motivo === "EM_ALERTA") return t.faltam(formatarDuracao(Math.abs(item.minutos)));
    return t.atrasoDe(formatarDuracao(Math.max(0, item.minutos)));
  };
  return (
    // Vermelho só com algo na lista: vazio, o cartão fica neutro (vermelho sempre quer dizer urgência).
    <Painel titulo={t.agirAgora} className={itens.length > 0 ? "agir-agora agir-agora-ativo" : "agir-agora"}>
      {itens.length === 0 ? (
        <p className="texto-apoio">{t.agirAgoraVazio}</p>
      ) : (
        <ul className="lista-agir">
          {itens.slice(0, VISIVEIS).map((item) => (
            <li key={item.chave}>
              <Link to={item.para} className={item.urgente ? "agir-urgente" : "agir-atencao"}>
                <span className="agir-linha">
                  <span className="agir-motivo">
                    {t.motivos[item.motivo]}
                    {tempo(item) && ` · ${tempo(item)}`}
                  </span>
                  {item.base && <span className="texto-apoio">{item.base}</span>}
                </span>
                {item.numero && <strong className="codigo">{item.numero}</strong>}
                {item.detalhe && (
                  <span className="texto-apoio">
                    {item.motivo === "EMERGENCIA" ? t.emergenciaDe(item.detalhe) : (t.detalhes[item.detalhe] ?? item.detalhe)}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {itens.length > VISIVEIS && <p className="texto-apoio">{t.agirAgoraMais(itens.length - VISIVEIS)}</p>}
    </Painel>
  );
}
