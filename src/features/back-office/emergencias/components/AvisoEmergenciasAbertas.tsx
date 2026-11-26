import { Link } from "react-router-dom";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Icone } from "../../../../shared/components/Icone";

/**
 * Faixa em todas as telas do back-office enquanto houver alerta de
 * emergência em aberto (HU30, RI18) - o e-mail pode não ser lido a tempo.
 * A contagem vem de usePendencias (AdminLayout), a mesma do balão do menu.
 */
export function AvisoEmergenciasAbertas({ abertos }: { abertos: number }) {
  const t = useTextos().backOffice.emergencias;

  if (abertos === 0) {
    return null;
  }
  return (
    <div role="alert" className="faixa-emergencia">
      <Icone nome="alerta" />
      <span>{t.abertos(abertos)}</span>
      <Link to="/admin/emergencias" className="botao perigo compacto">
        {t.verAgora}
      </Link>
    </div>
  );
}
