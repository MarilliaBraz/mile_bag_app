import { Icone, type NomeIcone } from "../../../shared/components/Icone";
import { useTextos } from "../../../shared/utils/i18n/idioma";
import { Revelar } from "./Revelar";

const ICONES: NomeIcone[] = ["sincronizar", "chave", "imagem", "contraste"];

/** Diferenciais que o sistema já entrega (HU38): nenhum número inventado. */
export function SecaoDiferenciais() {
  const t = useTextos().institucional.diferenciais;
  return (
    <section className="inst-secao inst-secao-alternada" aria-labelledby="inst-diferenciais">
      <div className="inst-largura">
        <Revelar>
          <h2 id="inst-diferenciais">{t.titulo}</h2>
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
