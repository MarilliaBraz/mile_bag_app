import { CartaoIndicador } from "../../../../shared/components/CartaoIndicador";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import type { ItemMala, PainelGestao } from "../types";
import { formatarDuracao, formatarPercentual } from "../utils/formatarPainel";

export type AbrirLista = (titulo: string, itens: ItemMala[], mostrar: "prazo" | "referencia") => void;

/** Topo do painel de gestão: radar de SLA, funil do dia, OTD e tempo médio de ciclo. */
export function PulsoOperacao({ painel, abrirLista }: { painel: PainelGestao; abrirLista: AbrirLista }) {
  const t = useTextos().backOffice.painel;
  const { radar, funil, otd, ciclo } = painel;
  return (
    <section className="secao-painel pilha" aria-labelledby="pulso-titulo">
      <div>
        <h2 id="pulso-titulo">{t.pulso}</h2>
        <p className="texto-apoio">{t.pulsoDescricao(painel.prazoPadraoHoras)}</p>
      </div>
      <div className="indicadores">
        <CartaoIndicador rotulo={t.noPrazo} valor={radar.noPrazo} tom="sucesso" para="/admin/entregas" />
        <CartaoIndicador
          rotulo={t.emAlerta}
          valor={radar.alerta.length}
          detalhe={t.emAlertaAjuda}
          tom="aviso"
          aoClicar={() => abrirLista(t.emAlerta, radar.alerta, "prazo")}
        />
        <CartaoIndicador
          rotulo={t.atrasadas}
          valor={radar.atrasadas.length}
          tom="erro"
          aoClicar={() => abrirLista(t.atrasadas, radar.atrasadas, "prazo")}
        />
      </div>
      <h3>{t.funil}</h3>
      <div className="indicadores">
        <CartaoIndicador
          rotulo={t.aguardandoColeta}
          valor={funil.aguardandoColeta}
          detalhe={t.aguardandoColetaAjuda}
          para="/admin/entregas"
        />
        <CartaoIndicador rotulo={t.emTransito} valor={funil.emTransito} detalhe={t.emTransitoAjuda} para="/admin/entregas" />
        <CartaoIndicador rotulo={t.entreguesHoje} valor={funil.entreguesHoje} tom="sucesso" para="/admin/entregas" />
        <CartaoIndicador
          rotulo={t.comOcorrencia}
          valor={funil.comOcorrencia}
          tom="aviso"
          aoClicar={() => abrirLista(t.comOcorrencia, painel.excecoes.tentativasFrustradas, "referencia")}
        />
      </div>
      <div className="indicadores">
        <CartaoIndicador
          rotulo={t.otd}
          valor={formatarPercentual(otd.hoje)}
          detalhe={t.otdAjuda(formatarPercentual(otd.trintaDias), otd.entregues30Dias)}
        />
        <CartaoIndicador
          rotulo={t.ciclo}
          valor={formatarDuracao(ciclo.minutosHoje)}
          detalhe={t.cicloAjuda(formatarDuracao(ciclo.minutos30Dias))}
        />
      </div>
    </section>
  );
}
