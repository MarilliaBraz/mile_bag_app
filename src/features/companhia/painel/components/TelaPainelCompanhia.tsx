import { useCallback, useState } from "react";
import { Alerta, Carregando } from "../../../../shared/components/Alerta";
import { useIntervaloEmPrimeiroPlano } from "../../../../shared/hooks/useIntervaloEmPrimeiroPlano";
import { formatarHora } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { obterPainelCompanhiaGestao } from "../services/painelCompanhiaService";
import type { PainelCompanhiaGestao } from "../types";
import {
  AeroportosCompanhia,
  AgirAgoraCompanhia,
  CustodiaCompanhia,
  FinanceiroCompanhia,
  MetasCompanhia,
  ParceirosCompanhia,
  SatisfacaoCompanhia,
} from "./BlocosCompanhia";
import { IndicadoresCompanhia } from "./IndicadoresCompanhia";

const INTERVALO_MS = 30_000;

/**
 * Início do administrador da companhia aérea, no formato cockpit: o prazo da ANAC no topo, quem está com a mala
 * agora, o que agir e cada aeroporto. Atualiza a cada 30 s com o app visível.
 */
export function TelaPainelCompanhia() {
  const t = useTextos().companhia.painelGestao;
  const [painel, setPainel] = useState<PainelCompanhiaGestao | null>(null);
  const [falhou, setFalhou] = useState(false);
  const atualizar = useCallback(() => {
    obterPainelCompanhiaGestao().then(
      (dados) => {
        setPainel(dados);
        setFalhou(false);
      },
      () => setFalhou(true),
    );
  }, []);
  useIntervaloEmPrimeiroPlano(atualizar, INTERVALO_MS);

  if (!painel) {
    return <main className="pagina">{falhou ? <Alerta tipo="erro">{t.falhaCarregar}</Alerta> : <Carregando />}</main>;
  }

  const { regulatorio } = painel;
  let frase = t.resumoOk;
  if (regulatorio.estourados > 0) {
    frase = t.resumoEstourados(regulatorio.estourados);
  } else if (regulatorio.atencao > 0) {
    frase = t.resumoAtencao(regulatorio.atencao);
  }
  const hoje = new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long" }).format(new Date(painel.geradoEm));
  const abertos = regulatorio.noPrazo + regulatorio.atencao + regulatorio.estourados;

  return (
    <main className="pagina cockpit">
      <header className="cockpit-cabecalho">
        <p className="cockpit-marca">{t.marca}</p>
        <h1 data-titulo={t.marca}>{frase}</h1>
        <p className="texto-apoio">{t.resumoDetalhe(hoje, abertos, formatarHora(painel.geradoEm))}</p>
      </header>
      {falhou && <Alerta tipo="aviso">{t.falhaCarregar}</Alerta>}
      <MetasCompanhia painel={painel} />
      <div className="cockpit-meio">
        <CustodiaCompanhia painel={painel} />
        <AgirAgoraCompanhia painel={painel} />
      </div>
      <AeroportosCompanhia painel={painel} />
      <ParceirosCompanhia painel={painel} />
      <FinanceiroCompanhia painel={painel} />
      <SatisfacaoCompanhia painel={painel} />
      <section className="secao-painel pilha" aria-labelledby="registro-titulo">
        <h2 id="registro-titulo">{t.registro}</h2>
        <IndicadoresCompanhia rascunhosPara="/companhia/bagagens?situacao=RASCUNHO" />
      </section>
    </main>
  );
}
