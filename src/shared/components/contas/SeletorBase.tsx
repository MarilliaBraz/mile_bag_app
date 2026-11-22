import { useId } from "react";
import { useTextos } from "../../utils/i18n/idioma";
import { useContas } from "./contexto";

/**
 * V52: a base aeroportuária da conta, obrigatória para motoristas (ele vê e é avisado só dos BDOs dela). Não aparece
 * nos cadastros sem base (funcionários da companhia).
 */
export function SeletorBase({ valor, aoMudar }: { valor: string; aoMudar: (baseId: string) => void }) {
  const uid = useId();
  const t = useTextos().backOffice.contasBase;
  const { bases } = useContas();
  if (bases === undefined) {
    return null;
  }
  return (
    <div>
      <label htmlFor={`${uid}-base`}>{t.base}</label>
      <select id={`${uid}-base`} required value={valor} onChange={(evento) => aoMudar(evento.target.value)} disabled={!bases?.length}>
        <option value="" disabled>
          {t.escolhaBase}
        </option>
        {bases?.map((base) => (
          <option key={base.id} value={base.id}>
            {base.codigoIata}
            {base.nome ? ` - ${base.nome}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
