import { useCallback, useState } from "react";
import { Alerta, Carregando } from "../../../../shared/components/Alerta";
import { CartaoIndicador } from "../../../../shared/components/CartaoIndicador";
import { Painel } from "../../../../shared/components/Pagina";
import { useIntervaloEmPrimeiroPlano } from "../../../../shared/hooks/useIntervaloEmPrimeiroPlano";
import { formatarDataHora, formatarMoeda, formatarNumero } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { obterPainelFrota } from "../services/painelService";
import type { PainelFrota, SituacaoMotorista } from "../types";
import { formatarPercentual } from "../utils/formatarPainel";

/** O custo resolve a tarifa de cada viagem do mês: consulta mais pesada, então a cada 5 minutos (não a cada 30 s). */
const INTERVALO_MS = 5 * 60_000;

const SELO: Record<SituacaoMotorista, string> = { EM_ROTA: "selo-info", DISPONIVEL: "selo-sucesso", OFFLINE: "" };

/** Fase 3 do painel de gestão: custo por mala, ocupação das saídas e situação e ranking dos motoristas. */
export function EficienciaFrota() {
  const t = useTextos().backOffice.painel;
  const [frota, setFrota] = useState<PainelFrota | null>(null);
  const [falhou, setFalhou] = useState(false);

  const atualizar = useCallback(() => {
    obterPainelFrota().then(
      (dados) => {
        setFrota(dados);
        setFalhou(false);
      },
      () => setFalhou(true),
    );
  }, []);
  useIntervaloEmPrimeiroPlano(atualizar, INTERVALO_MS);

  if (!frota) {
    return (
      <Painel titulo={t.frota} className="secao-painel">
        {falhou ? <Alerta tipo="erro">{t.falhaFrota}</Alerta> : <Carregando />}
      </Painel>
    );
  }

  const { custoHoje, custo30Dias, ocupacao30Dias } = frota;
  const metadeComUmaMala = ocupacao30Dias.saidas > 0 && ocupacao30Dias.saidasComUmaMala * 2 > ocupacao30Dias.saidas;
  return (
    <section className="secao-painel pilha" aria-labelledby="frota-titulo">
      <div>
        <h2 id="frota-titulo">{t.frota}</h2>
        <p className="texto-apoio">{t.frotaDescricao}</p>
      </div>
      {falhou && <Alerta tipo="aviso">{t.falhaFrota}</Alerta>}
      <div className="indicadores">
        <CartaoIndicador
          rotulo={t.custoPorMala}
          valor={custoHoje.porMala === null ? "–" : formatarMoeda(custoHoje.porMala)}
          detalhe={t.custoPorMalaAjuda(
            custo30Dias.porMala === null ? "–" : formatarMoeda(custo30Dias.porMala),
            formatarMoeda(custo30Dias.total),
          )}
        />
        <CartaoIndicador
          rotulo={t.custoPorKm}
          valor={custo30Dias.porKm === null ? "–" : formatarMoeda(custo30Dias.porKm)}
          detalhe={t.custoPorKmAjuda(formatarNumero(custo30Dias.km, 1))}
        />
        <CartaoIndicador
          rotulo={t.malasPorSaida}
          valor={ocupacao30Dias.malasPorSaida === null ? "–" : formatarNumero(ocupacao30Dias.malasPorSaida, 1)}
          detalhe={t.malasPorSaidaAjuda(ocupacao30Dias.saidasComUmaMala, ocupacao30Dias.saidas)}
          tom={metadeComUmaMala ? "aviso" : undefined}
        />
        <CartaoIndicador
          rotulo={t.viagensSemValor}
          valor={custo30Dias.viagensSemValor}
          detalhe={t.viagensSemValorAjuda}
          tom="aviso"
          para="/admin/fechamentos"
        />
      </div>
      <div className="grade-paineis">
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
      </div>
    </section>
  );
}
