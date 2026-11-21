import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatarHora } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Icone } from "../../../../shared/components/Icone";
import { listarCorrigiveis, type EntregaCorrigivel } from "../services/correcaoService";

/** V51: no painel, as entregas finalizadas que o motorista ainda pode corrigir (até 24 h). Sem internet, some. */
export function EntregasCorrigiveis() {
  const t = useTextos().motorista.corrigirEntrega;
  const [entregas, setEntregas] = useState<EntregaCorrigivel[]>([]);

  useEffect(() => {
    listarCorrigiveis()
      .then(setEntregas)
      .catch(() => setEntregas([]));
  }, []);

  if (entregas.length === 0) {
    return null;
  }
  return (
    <section aria-labelledby="corrigiveis-titulo">
      <h2 id="corrigiveis-titulo">{t.listaTitulo}</h2>
      <ul className="lista">
        {entregas.map((entrega) => (
          <li key={entrega.entregaId} className="cartao">
            <Link to={`/motorista/entregas/${entrega.entregaId}/corrigir`} viewTransition className="cartao-link">
              <span className="codigo">{entrega.bdoNumero ?? "—"}</span> {entrega.passageiroNome ?? ""}
              <span className="texto-apoio linha-icone">
                <Icone nome="ferramenta" /> {t.ate(formatarHora(entrega.corrigivelAte))}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
