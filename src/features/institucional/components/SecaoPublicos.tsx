import { useState } from "react";
import { Icone } from "../../../shared/components/Icone";
import { useTextos } from "../../../shared/utils/i18n/idioma";
import { Revelar } from "./Revelar";

type Publico = "empresa" | "companhia";
const PUBLICOS: Publico[] = ["empresa", "companhia"];

/** O que cada público ganha (HU38): abas no celular, duas colunas a partir de 900 px (o CSS mostra as duas). */
export function SecaoPublicos() {
  const t = useTextos().institucional.publicos;
  const [ativo, setAtivo] = useState<Publico>("empresa");

  return (
    <section className="inst-secao" aria-labelledby="inst-publicos">
      <div className="inst-largura">
        <Revelar>
          <h2 id="inst-publicos">{t.titulo}</h2>
        </Revelar>
        <div className="inst-abas" role="tablist" aria-label={t.abas}>
          {PUBLICOS.map((publico) => (
            <button
              key={publico}
              type="button"
              role="tab"
              id={`inst-aba-${publico}`}
              aria-controls={`inst-painel-${publico}`}
              aria-selected={ativo === publico}
              onClick={() => setAtivo(publico)}
            >
              {t[publico].titulo}
            </button>
          ))}
        </div>
        <div className="inst-publicos">
          {PUBLICOS.map((publico, indice) => (
            <div
              key={publico}
              id={`inst-painel-${publico}`}
              role="tabpanel"
              aria-labelledby={`inst-aba-${publico}`}
              className="inst-publico"
              hidden={ativo !== publico}
            >
              <Revelar atraso={indice * 0.1} className="inst-cartao">
                <span className="inst-cartao-icone" aria-hidden="true">
                  <Icone nome={publico === "empresa" ? "caminhao" : "mala"} />
                </span>
                <h3>{t[publico].titulo}</h3>
                <ul>
                  {t[publico].itens.map((item) => (
                    <li key={item}>
                      <Icone nome="check" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Revelar>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
