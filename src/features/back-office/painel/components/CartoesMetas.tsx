import { formatarMoeda, formatarNumero } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import type { PainelFrota, PainelGestao } from "../types";
import { comparar, type Comparacao } from "../utils/cockpit";
import { formatarDuracao, formatarPercentual } from "../utils/formatarPainel";
import { AnelProgresso } from "./graficos/AnelProgresso";
import { MiniGrafico } from "./graficos/MiniGrafico";

const ULTIMOS_DIAS_BARRAS = 7;

/** Verde quando melhorou, vermelho quando piorou: o gestor vê a direção sem ler o número. */
function TextoComparacao({ comparacao, formatar }: { comparacao: Comparacao; formatar: (diferenca: number) => string }) {
  const t = useTextos().backOffice.painel;
  if (comparacao.tipo === "sem") return <span className="texto-apoio">{t.semComparacao}</span>;
  if (comparacao.tipo === "igual") return <span className="texto-apoio">{t.igualMedia}</span>;
  const texto = comparacao.tipo === "melhor" ? t.melhorQue(formatar(comparacao.diferenca)) : t.piorQue(formatar(comparacao.diferenca));
  return <span className={comparacao.tipo === "melhor" ? "comparacao-melhor" : "comparacao-pior"}>{texto}</span>;
}

/** Linha de metas do cockpit: OTD contra a meta, tempo base → porta, custo por mala e malas por saída. */
export function CartoesMetas({
  gestao,
  frota,
  verAtrasadas,
}: {
  gestao: PainelGestao;
  frota: PainelFrota | null;
  verAtrasadas: () => void;
}) {
  const t = useTextos().backOffice.painel;
  const { otd, metaOtd, ciclo, serie, radar } = gestao;
  const atrasadas = radar.atrasadas.length;
  let otdTexto = t.otdSemEntrega;
  if (otd.hoje !== null) {
    otdTexto = otd.hoje >= metaOtd ? t.otdAtingida : t.otdFalta(formatarNumero(metaOtd - otd.hoje, 1));
  }
  const ocupacao = frota?.ocupacao30Dias;
  const ultimosDias = frota?.serie.slice(-ULTIMOS_DIAS_BARRAS) ?? [];
  const maiorOcupacao = Math.max(1, ...ultimosDias.map((dia) => dia.malasPorSaida ?? 0));
  return (
    <section className="cockpit-metas" aria-label={t.pulso}>
      <div className="cartao-otd">
        <AnelProgresso
          percentual={otd.hoje}
          meta={metaOtd}
          texto={formatarPercentual(otd.hoje)}
          subtexto={t.otdMeta(metaOtd)}
          rotulo={t.otdAnel(formatarPercentual(otd.hoje), metaOtd)}
        />
        <div className="cartao-otd-texto">
          <span className="cartao-meta-rotulo">{t.otd}</span>
          <span>{otdTexto}</span>
          {atrasadas > 0 && (
            <button type="button" className="link-botao" onClick={verAtrasadas}>
              {t.verAtrasadas(atrasadas)} →
            </button>
          )}
        </div>
      </div>
      <div className="cartao-meta">
        <span className="cartao-meta-rotulo">{t.ciclo}</span>
        <span className="cartao-meta-valor">{formatarDuracao(ciclo.minutosHoje)}</span>
        <MiniGrafico valores={serie.map((dia) => dia.cicloMinutos)} />
        <TextoComparacao
          comparacao={comparar(ciclo.minutosHoje, ciclo.minutos30Dias, true)}
          formatar={(d) => formatarDuracao(Math.round(d))}
        />
      </div>
      <div className="cartao-meta">
        <span className="cartao-meta-rotulo">{t.custoPorMala}</span>
        <span className="cartao-meta-valor">{frota?.custoHoje.porMala == null ? "–" : formatarMoeda(frota.custoHoje.porMala)}</span>
        <MiniGrafico valores={frota?.serie.map((dia) => dia.custoPorMala) ?? []} cor="var(--confirmacao)" />
        <TextoComparacao
          comparacao={comparar(frota?.custoHoje.porMala ?? null, frota?.custo30Dias.porMala ?? null, true)}
          formatar={(d) => formatarMoeda(d)}
        />
      </div>
      <div className="cartao-meta">
        <span className="cartao-meta-rotulo">{t.malasPorSaida}</span>
        <span className="cartao-meta-valor">{ocupacao?.malasPorSaida == null ? "–" : formatarNumero(ocupacao.malasPorSaida, 1)}</span>
        <div className="mini-barras" aria-hidden="true">
          {ultimosDias.map((dia) => (
            <span key={dia.dia} style={{ height: `${Math.max(6, ((dia.malasPorSaida ?? 0) / maiorOcupacao) * 100)}%` }} />
          ))}
        </div>
        <span className="texto-apoio">
          {ocupacao && ocupacao.saidas > 0
            ? t.umaMalaSo(formatarPercentual((ocupacao.saidasComUmaMala * 100) / ocupacao.saidas))
            : t.semComparacao}
        </span>
      </div>
    </section>
  );
}
