import { useCallback, useState } from "react";
import { Alerta } from "../../../../shared/components/Alerta";
import { CartaoIndicador } from "../../../../shared/components/CartaoIndicador";
import { useIntervaloEmPrimeiroPlano } from "../../../../shared/hooks/useIntervaloEmPrimeiroPlano";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { obterPainelCompanhia } from "../services/painelCompanhiaService";
import type { PainelCompanhia } from "../types";

const INTERVALO_MS = 30_000;

/**
 * Item 5: números do que a companhia ainda precisa fazer. Fica no início do administrador e no topo do início do
 * funcionário; sem `rascunhosPara`, o cartão de rascunhos não é link (o funcionário já vê a lista logo abaixo).
 */
export function IndicadoresCompanhia({ rascunhosPara }: { rascunhosPara?: string }) {
  const t = useTextos().backOffice.painel;
  const [painel, setPainel] = useState<PainelCompanhia | null>(null);
  const [falhou, setFalhou] = useState(false);

  const atualizar = useCallback(() => {
    obterPainelCompanhia().then(
      (dados) => {
        setPainel(dados);
        setFalhou(false);
      },
      () => setFalhou(true),
    );
  }, []);
  useIntervaloEmPrimeiroPlano(atualizar, INTERVALO_MS);

  return (
    <>
      {falhou && <Alerta tipo="aviso">{t.falhaCarregar}</Alerta>}
      <div className="indicadores">
        <CartaoIndicador
          rotulo={t.rascunhos}
          valor={painel?.rascunhos ?? null}
          detalhe={t.rascunhosAjuda}
          tom="aviso"
          para={rascunhosPara}
        />
        <CartaoIndicador
          rotulo={t.semEncaminhamento}
          valor={painel?.semEncaminhamento ?? null}
          detalhe={t.semEncaminhamentoAjuda}
          tom="aviso"
          para="/companhia/bagagens"
        />
        <CartaoIndicador rotulo={t.encaminhadasAndamento} valor={painel?.emAndamento ?? null} para="/companhia/bagagens" />
        <CartaoIndicador
          rotulo={t.naoEntregues}
          valor={painel?.naoEntregues ?? null}
          detalhe={t.naoEntreguesAjuda}
          tom="erro"
          para="/companhia/bagagens"
        />
      </div>
    </>
  );
}
