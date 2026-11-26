import { MapaBase, type MarcadorMapa } from "../../../../shared/components/MapaBase";
import { Painel } from "../../../../shared/components/Pagina";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import type { BaseOperacao, SituacaoBase } from "../types";
import { formatarDuracao } from "../utils/formatarPainel";

/** Centro do Brasil, para o mapa abrir mostrando o país quando há uma base só. */
const CENTRO_BRASIL = { latitude: -14.2, longitude: -51.9 };

const TOM: Record<SituacaoBase, "sucesso" | "aviso" | "erro"> = { NORMAL: "sucesso", RETENCAO: "aviso", CRITICO: "erro" };
const SELO: Record<SituacaoBase, string> = { NORMAL: "selo-sucesso", RETENCAO: "selo-aviso", CRITICO: "selo-erro" };

/** Fase 2: mapa com a situação de cada base e as piores do dia em tabela (a mesma informação do mapa, em texto). */
export function BasesOperacao({ bases, ranking }: { bases: BaseOperacao[]; ranking: BaseOperacao[] }) {
  const t = useTextos().backOffice.painel;
  const comPosicao = bases.filter((base) => base.latitude !== null && base.longitude !== null);
  const semPosicao = bases.filter((base) => base.codigo && (base.latitude === null || base.longitude === null));
  const marcadores: MarcadorMapa[] = comPosicao.map((base) => ({
    posicao: { latitude: base.latitude as number, longitude: base.longitude as number },
    rotulo: t.popupBase(base.codigo, t.situacoesBase[base.situacao], base.aguardandoColeta, base.atrasadas),
    tom: TOM[base.situacao],
    texto: base.codigo,
  }));
  const nomeDa = (base: BaseOperacao) => base.codigo || t.semBase;

  return (
    <div className="grade-paineis secao-painel">
      <Painel titulo={t.bases} descricao={t.basesDescricao}>
        <MapaBase
          key={marcadores.map((m) => m.texto).join()}
          centro={marcadores[0]?.posicao ?? CENTRO_BRASIL}
          marcadores={marcadores}
          zoom={marcadores.length === 1 ? 9 : 4}
          altura={340}
          descricao={t.mapaBases}
        />
        <ul className="legenda-situacao">
          {(Object.keys(TOM) as SituacaoBase[]).map((situacao) => (
            <li key={situacao}>
              <span className={`selo ${SELO[situacao]}`}>{t.situacoesBase[situacao]}</span>
            </li>
          ))}
        </ul>
        {semPosicao.length > 0 && <p className="texto-apoio">{t.semPosicao(semPosicao.map((base) => base.codigo).join(", "))}</p>}
      </Painel>
      <Painel titulo={t.ranking} descricao={t.rankingDescricao}>
        {ranking.length === 0 ? (
          <p className="texto-apoio">{t.rankingVazio}</p>
        ) : (
          <div className="tabela-rolavel">
            <table className="tabela">
              <thead>
                <tr>
                  <th scope="col">{t.colBase}</th>
                  <th scope="col">{t.colSituacao}</th>
                  <th scope="col">{t.colAguardando}</th>
                  <th scope="col">{t.colEsperaMedia}</th>
                  <th scope="col">{t.colMaiorEspera}</th>
                  <th scope="col">{t.colAtrasadas}</th>
                  <th scope="col">{t.colColetaHoje}</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((base) => (
                  <tr key={nomeDa(base)}>
                    <th scope="row">{nomeDa(base)}</th>
                    <td>
                      <span className={`selo ${SELO[base.situacao]}`}>{t.situacoesBase[base.situacao]}</span>
                    </td>
                    <td>{base.aguardandoColeta}</td>
                    <td>{formatarDuracao(base.esperaMediaMinutos)}</td>
                    <td>{formatarDuracao(base.maiorEsperaMinutos)}</td>
                    <td>{base.atrasadas}</td>
                    <td>{formatarDuracao(base.coletaMediaHojeMinutos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Painel>
    </div>
  );
}
