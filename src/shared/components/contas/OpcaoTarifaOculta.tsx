import { useTextos } from "../../utils/i18n/idioma";
import { useContas } from "./contexto";

/**
 * V58: a empresa escolhe, por motorista, se ele vê a tarifa paga por viagem. Oculta, o relatório dele mostra só os km
 * (ou "Entrega local") e o pedágio. Não aparece nos cadastros sem essa escolha (funcionários da companhia).
 */
export function OpcaoTarifaOculta({ valor, aoMudar }: { valor: boolean; aoMudar: (ocultar: boolean) => void }) {
  const t = useTextos().backOffice.contasBase;
  const { servico } = useContas();
  if (!servico.tarifaPorConta) {
    return null;
  }
  return (
    <div>
      <label className="interruptor">
        <input type="checkbox" checked={valor} onChange={(evento) => aoMudar(evento.target.checked)} />
        {t.ocultarTarifa}
      </label>
      <span className="texto-apoio">{t.ocultarTarifaAjuda}</span>
    </div>
  );
}
