import { useTextos } from "../../../shared/utils/i18n/idioma";
import { Revelar } from "./Revelar";

/** Os três passos até operar (HU38); os planos ficam para a conversa da demonstração. */
export function SecaoComoComecar() {
  const t = useTextos().institucional.comoComecar;
  return (
    <section className="inst-secao" aria-labelledby="inst-como-comecar">
      <div className="inst-largura">
        <Revelar>
          <h2 id="inst-como-comecar">{t.titulo}</h2>
        </Revelar>
        <ol className="inst-passos">
          {t.passos.map((passo, indice) => (
            <li key={passo.titulo}>
              <Revelar atraso={indice * 0.1} className="inst-cartao">
                <h3>{passo.titulo}</h3>
                <p>{passo.texto}</p>
              </Revelar>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
