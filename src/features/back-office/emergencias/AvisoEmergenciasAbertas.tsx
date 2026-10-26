import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EVENTO_ALERTAS_ALTERADOS, listarAlertas } from "../../../shared/api/emergenciaApi";
import { useIntervaloEmPrimeiroPlano } from "../../../shared/hooks/useIntervaloEmPrimeiroPlano";
import { useTextos } from "../../../shared/i18n/idioma";
import { Icone } from "../../../shared/ui/Icone";

const INTERVALO_CONSULTA_MS = 30_000;

/**
 * Faixa em todas as telas do back-office enquanto houver alerta de
 * emergência em aberto (HU30, RI18) - o e-mail pode não ser lido a tempo.
 */
export function AvisoEmergenciasAbertas() {
  const [abertos, setAbertos] = useState(0);
  const t = useTextos().backOffice.emergencias;

  const consultar = useCallback(() => {
    listarAlertas("ABERTO")
      .then((alertas) => setAbertos(alertas.length))
      // Falha na consulta não pode atrapalhar a tela em uso; tenta de novo no próximo ciclo.
      .catch(() => undefined);
  }, []);

  useIntervaloEmPrimeiroPlano(consultar, INTERVALO_CONSULTA_MS);

  // Alerta atendido na tela de emergências: a faixa some na hora, sem esperar o próximo ciclo.
  useEffect(() => {
    window.addEventListener(EVENTO_ALERTAS_ALTERADOS, consultar);
    return () => window.removeEventListener(EVENTO_ALERTAS_ALTERADOS, consultar);
  }, [consultar]);

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
