import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Icone } from "../../../../shared/components/Icone";
import type { Coordenada } from "../types";

/**
 * Abre o Waze já navegando até o endereço de entrega (HU03, FR-008 revisado): só a navegação vai para o app externo.
 * Rota, quilometragem, pedágio e cobrança continuam sendo os calculados e registrados pelo Milebag. O link universal
 * abre o app do Waze se estiver instalado e, se não, a página do Waze no navegador.
 */
export function NavegarComWaze({ destino }: { destino: Coordenada }) {
  const t = useTextos().motorista.rota;
  const link = `https://waze.com/ul?ll=${destino.latitude},${destino.longitude}&navigate=yes`;

  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="botao secundario bloco mt-3">
      <Icone nome="carro" /> {t.navegarComWaze}
    </a>
  );
}
