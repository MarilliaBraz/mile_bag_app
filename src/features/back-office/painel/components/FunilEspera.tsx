import { Painel } from "../../../../shared/components/Pagina";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import type { BaseOperacao, PainelGestao, SituacaoBase } from "../types";
import { formatarDuracao } from "../utils/formatarPainel";

const COR_BASE: Record<SituacaoBase, string> = { NORMAL: "barra-normal", RETENCAO: "barra-retencao", CRITICO: "barra-critico" };

/** Funil do dia numa barra só e a espera para coleta de cada base, a pior primeiro. */
export function FunilEspera({ gestao, bases }: { gestao: PainelGestao; bases: BaseOperacao[] }) {
  const t = useTextos().backOffice.painel;
  const { funil } = gestao;
  const partes = [
    { chave: "aguardando", rotulo: t.aguardandoColeta, valor: funil.aguardandoColeta, classe: "funil-aguardando" },
    { chave: "transito", rotulo: t.emTransito, valor: funil.emTransito, classe: "funil-transito" },
    { chave: "entregues", rotulo: t.entreguesHoje, valor: funil.entreguesHoje, classe: "funil-entregues" },
    { chave: "ocorrencia", rotulo: t.comOcorrencia, valor: funil.comOcorrencia, classe: "funil-ocorrencia" },
  ];
  const total = funil.aguardandoColeta + funil.emTransito + funil.entreguesHoje;
  const esperando = bases
    .filter((base) => base.aguardandoColeta > 0 && base.esperaMediaMinutos !== null)
    .sort((a, b) => (b.esperaMediaMinutos ?? 0) - (a.esperaMediaMinutos ?? 0));
  const maiorEspera = Math.max(1, ...esperando.map((base) => base.esperaMediaMinutos ?? 0));
  return (
    <div className="grade-paineis secao-painel">
      <Painel titulo={t.funil}>
        {total === 0 ? (
          <p className="texto-apoio">{t.funilVazio}</p>
        ) : (
          <>
            <div className="barra-funil" aria-hidden="true">
              {partes
                .filter((parte) => parte.valor > 0 && parte.chave !== "ocorrencia")
                .map((parte) => (
                  <span key={parte.chave} className={parte.classe} style={{ flexGrow: parte.valor }}>
                    {parte.valor}
                  </span>
                ))}
            </div>
            <ul className="legenda-funil">
              {partes.map((parte) => (
                <li key={parte.chave}>
                  <span className={`ponto-funil ${parte.classe}`} aria-hidden="true" />
                  {parte.rotulo}: <strong>{parte.valor}</strong>
                </li>
              ))}
            </ul>
          </>
        )}
      </Painel>
      <Painel titulo={t.esperaBase} descricao={t.esperaBaseLegenda}>
        {esperando.length === 0 ? (
          <p className="texto-apoio">{t.esperaBaseVazia}</p>
        ) : (
          <ul className="barras-base">
            {esperando.map((base) => (
              <li key={base.codigo || t.semBase}>
                <strong>{base.codigo || t.semBase}</strong>
                <span className="barra-trilho" aria-hidden="true">
                  <span className={COR_BASE[base.situacao]} style={{ width: `${((base.esperaMediaMinutos ?? 0) / maiorEspera) * 100}%` }} />
                </span>
                <span className="barra-valor">
                  {formatarDuracao(base.esperaMediaMinutos)}
                  <span className="visualmente-oculto"> · {t.situacoesBase[base.situacao]}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Painel>
    </div>
  );
}
