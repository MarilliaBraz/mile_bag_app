import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { formatarDataHora, formatarNumero } from "../../../../shared/utils/formatar";
import type { KmViagem } from "../types";

/**
 * Item 9: auditoria do km de cada viagem encerrada - o calculado (ida e volta), o percorrido na ida (GPS) e o que entrou
 * no pagamento. Na cidade da base paga o valor fixo e o km fica só como registro.
 */
export function KmDaViagem({ viagens }: { viagens: KmViagem[] }) {
  const t = useTextos().backOffice.entregas.km;
  if (viagens.length === 0) {
    return null;
  }
  const km = (valor: number | null) => (valor == null ? "—" : formatarNumero(valor, 1));

  return (
    <section className="cartao mb-3" aria-label={t.titulo}>
      <h3 className="mb-2">{t.titulo}</h3>
      <ul className="lista" style={{ gap: "0.75rem" }}>
        {viagens.map((viagem) => (
          <li key={viagem.dataInicio}>
            <div className="texto-apoio">
              {formatarDataHora(viagem.dataInicio)}
              {viagem.motoristaNome && ` · ${viagem.motoristaNome}`}
            </div>
            <div>{t.calculado(km(viagem.kmIdaCalculado), km(viagem.kmVoltaCalculado))}</div>
            <div>{viagem.kmPercorrido == null ? t.semPercorrido : t.percorrido(km(viagem.kmPercorrido))}</div>
            {viagem.valorFixo ? (
              <div className="texto-apoio">{t.valorFixo}</div>
            ) : (
              viagem.kmIdaPago != null && (
                <div>
                  <strong>{t.pago(km(viagem.kmIdaPago), km(viagem.kmVoltaPago))}</strong>
                  {viagem.usouPercorrido && <span className="selo selo-aviso"> {t.usouPercorrido}</span>}
                </div>
              )
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
