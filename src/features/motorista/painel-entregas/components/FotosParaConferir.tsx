import { Link } from "react-router-dom";
import { formatarDataHora } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Icone } from "../../../../shared/components/Icone";
import type { EstadoCapturaBdo } from "../../../../shared/types/bdo";
import type { BdoResponse } from "../../../../shared/types/bdo";

/**
 * Fotos de BDO do motorista que ainda esperam conferência (HU01/HU08) -
 * principalmente as tiradas sem internet, que só viram BDO na sincronização,
 * quando o motorista já saiu da tela de captura. Cada uma abre a mesma tela
 * de conferência, com confirmar ou descartar.
 */
export function FotosParaConferir({ bdos }: { bdos: BdoResponse[] }) {
  const t = useTextos().motorista.fotosConferir;
  if (bdos.length === 0) {
    return null;
  }

  return (
    <section>
      <h2>{t.titulo(bdos.length)}</h2>
      <p className="texto-apoio">{t.explicacao}</p>
      <ul className="lista">
        {bdos.map((bdo) => {
          const estado: EstadoCapturaBdo = { bdoParaConferir: bdo };
          const capturadoEm = formatarDataHora(bdo.dataCaptura);
          return (
            <li key={bdo.id}>
              <Link to="/motorista/captura-bdo" state={estado} className="cartao-link">
                <div className="cartao-corpo">
                  <div className="cartao-cabecalho">
                    <span className="codigo">{bdo.camposExtraidos.numero || t.numeroNaoLido}</span>
                    <span className="selo selo-aviso">{t.conferir}</span>
                  </div>
                  <div className="destaque">{bdo.camposExtraidos.passageiroNome || t.passageiroNaoLido}</div>
                  <div className="linha-icone texto-apoio">
                    <Icone nome="camera" />
                    <span>{t.fotoDe(capturadoEm)}</span>
                  </div>
                </div>
                <Icone nome="chevron" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
