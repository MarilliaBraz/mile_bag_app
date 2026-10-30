import { Icone, type NomeIcone } from "../../../shared/components/Icone";
import { useTextos } from "../../../shared/utils/i18n/idioma";
import { Revelar } from "./Revelar";

const ICONES: NomeIcone[] = ["mala", "documento", "telefone", "moeda"];

/** As dores dos dois lados antes do Milebag (HU38). */
export function SecaoProblema() {
  const t = useTextos().institucional.problema;
  return (
    <section className="inst-secao" aria-labelledby="inst-problema">
      <div className="inst-largura">
        <Revelar>
          <h2 id="inst-problema">{t.titulo}</h2>
        </Revelar>
        <div className="inst-cartoes">
          {t.itens.map((item, indice) => (
            <Revelar key={item.titulo} atraso={indice * 0.08} className="inst-cartao">
              <span className="inst-cartao-icone" aria-hidden="true">
                <Icone nome={ICONES[indice]} />
              </span>
              <h3>{item.titulo}</h3>
              <p>{item.texto}</p>
            </Revelar>
          ))}
        </div>
      </div>
    </section>
  );
}
