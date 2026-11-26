import { Alerta, Carregando } from "../../../../shared/components/Alerta";
import { Painel } from "../../../../shared/components/Pagina";
import { formatarDataHora, formatarNumero } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import type { PainelFrota, SituacaoMotorista } from "../types";
import { formatarPercentual } from "../utils/formatarPainel";

const SELO: Record<SituacaoMotorista, string> = { EM_ROTA: "selo-info", DISPONIVEL: "selo-sucesso", OFFLINE: "" };

/**
 * Frota: motoristas por praça e ranking de pontualidade e primeira tentativa. Custo por mala e malas por saída ficam
 * nos cartões de metas do topo; aqui só o aviso das viagens que ficaram fora do custo.
 */
export function EficienciaFrota({ frota, falhou }: { frota: PainelFrota | null; falhou: boolean }) {
  const t = useTextos().backOffice.painel;
  if (!frota) {
    return (
      <Painel titulo={t.frota} className="secao-painel">
        {falhou ? <Alerta tipo="erro">{t.falhaFrota}</Alerta> : <Carregando />}
      </Painel>
    );
  }

  return (
    <section className="secao-painel pilha" aria-labelledby="frota-titulo">
      <div>
        <h2 id="frota-titulo">{t.frota}</h2>
        <p className="texto-apoio">{t.frotaDescricao}</p>
      </div>
      {falhou && <Alerta tipo="aviso">{t.falhaFrota}</Alerta>}
      {frota.custo30Dias.viagensSemValor > 0 && (
        <Alerta tipo="aviso">
          {t.viagensSemValor}: {frota.custo30Dias.viagensSemValor}. {t.viagensSemValorAjuda}.
        </Alerta>
      )}
      <Painel titulo={t.pracas}>
        <div className="tabela-rolavel">
          <table className="tabela">
            <thead>
              <tr>
                <th scope="col">{t.colPraca}</th>
                <th scope="col">{t.colEmRota}</th>
                <th scope="col">{t.colDisponiveis}</th>
                <th scope="col">{t.colOffline}</th>
              </tr>
            </thead>
            <tbody>
              {frota.pracas.map((praca) => (
                <tr key={praca.base}>
                  <th scope="row">{praca.base || t.semBase}</th>
                  <td>{praca.emRota}</td>
                  <td>{praca.disponiveis}</td>
                  <td>{praca.offline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Painel>
      <Painel titulo={t.motoristasRanking}>
        {frota.motoristas.length === 0 ? (
          <p className="texto-apoio">{t.motoristasVazio}</p>
        ) : (
          <div className="tabela-rolavel">
            <table className="tabela">
              <thead>
                <tr>
                  <th scope="col">{t.colMotorista}</th>
                  <th scope="col">{t.colSituacao}</th>
                  <th scope="col">{t.colEntregas}</th>
                  <th scope="col">{t.colPontualidade}</th>
                  <th scope="col">{t.colPrimeiraTentativa}</th>
                  <th scope="col">{t.colMalasSaida}</th>
                </tr>
              </thead>
              <tbody>
                {frota.motoristas.map((motorista) => (
                  <tr key={motorista.id}>
                    <th scope="row">
                      {motorista.nome ?? "–"}
                      <span className="texto-apoio em-bloco">
                        {[motorista.base, motorista.ultimoAcesso && `${t.colUltimoAcesso}: ${formatarDataHora(motorista.ultimoAcesso)}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </th>
                    <td>
                      <span className={`selo ${SELO[motorista.situacao]}`.trim()}>{t.situacoesMotorista[motorista.situacao]}</span>
                    </td>
                    <td>{motorista.entregas}</td>
                    <td>{formatarPercentual(motorista.pontualidade)}</td>
                    <td>{formatarPercentual(motorista.primeiraTentativa)}</td>
                    <td>{motorista.malasPorSaida === null ? "–" : formatarNumero(motorista.malasPorSaida, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Painel>
    </section>
  );
}
