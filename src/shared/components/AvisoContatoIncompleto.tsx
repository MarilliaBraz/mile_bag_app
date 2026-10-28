import { useTextos } from "../utils/i18n/idioma";
import { Alerta } from "./Alerta";

/** Espelha com.marillia.milebag.business.bdo.model.PendenciaContatoBdo (mile_bag_api). */
export type PendenciaContatoBdo = "ENDERECO_AUSENTE" | "ENDERECO_SEM_NUMERO" | "TELEFONE_AUSENTE" | "TELEFONE_INVALIDO";

/**
 * Aviso de dados de contato incompletos do BDO (RN15/RI16, HU28) - só
 * informa: nunca desabilita confirmar, assumir ou entregar.
 */
export function AvisoContatoIncompleto({
  pendencias = [],
  compacto = false,
}: {
  // Opcional: respostas guardadas antes de HU28 (cache offline) não trazem o campo.
  pendencias?: PendenciaContatoBdo[];
  compacto?: boolean;
}) {
  const t = useTextos().contato;
  if (pendencias.length === 0) {
    return null;
  }
  return (
    <Alerta tipo="aviso" className={compacto ? "mt-2" : ""}>
      <strong>{t.confirmeAntes}</strong>
      <ul className="lista-simples">
        {pendencias.map((pendencia) => (
          <li key={pendencia}>{t.pendencias[pendencia]}</li>
        ))}
      </ul>
    </Alerta>
  );
}
