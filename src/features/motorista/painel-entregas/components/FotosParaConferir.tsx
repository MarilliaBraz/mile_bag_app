import { Link } from "react-router-dom";
import { Icone } from "../../../../shared/ui/Icone";
import type { EstadoCapturaBdo } from "../../captura-bdo/components/CapturaBdo";
import type { BdoResponse } from "../../captura-bdo/types";

/**
 * Fotos de BDO do motorista que ainda esperam conferência (HU01/HU08) -
 * principalmente as tiradas sem internet, que só viram BDO na sincronização,
 * quando o motorista já saiu da tela de captura. Cada uma abre a mesma tela
 * de conferência, com confirmar ou descartar.
 */
export function FotosParaConferir({ bdos }: { bdos: BdoResponse[] }) {
  if (bdos.length === 0) {
    return null;
  }

  return (
    <section>
      <h2>Fotos de BDO para conferir ({bdos.length})</h2>
      <p className="texto-apoio">O BDO só fica disponível para entrega depois que você conferir os campos e confirmar.</p>
      <ul className="lista">
        {bdos.map((bdo) => {
          const estado: EstadoCapturaBdo = { bdoParaConferir: bdo };
          const capturadoEm = new Date(bdo.dataCaptura).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <li key={bdo.id}>
              <Link to="/motorista/captura-bdo" state={estado} className="cartao-link">
                <div className="cartao-corpo">
                  <div className="cartao-cabecalho">
                    <span className="codigo">{bdo.camposExtraidos.numero || "Número não lido"}</span>
                    <span className="selo selo-aviso">Conferir</span>
                  </div>
                  <div className="destaque">{bdo.camposExtraidos.passageiroNome || "Passageiro não lido"}</div>
                  <div className="linha-icone texto-apoio">
                    <Icone nome="camera" />
                    <span>Foto de {capturadoEm}</span>
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
