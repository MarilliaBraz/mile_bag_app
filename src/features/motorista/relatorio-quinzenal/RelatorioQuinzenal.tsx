import { Ajuda } from "../../../shared/ui/Ajuda";
import { Alerta, Carregando, Vazio } from "../../../shared/ui/Alerta";
import { Icone } from "../../../shared/ui/Icone";
import { TelaMotorista } from "../layout/TelaMotorista";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../../../shared/api/ApiError";
import { formatarData, formatarMoeda, formatarNumero } from "../../../shared/format/formatar";
import { obterTextos, useTextos } from "../../../shared/i18n/idioma";
import { AjusteForm } from "./AjusteForm";
import { HistoricoAjustes } from "./HistoricoAjustes";
import { consultarRelatorio, type RelatorioQuinzenal as Relatorio } from "./relatorioService";

function paraIso(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

/** Quinzena em andamento: dias 1 a 15 ou 16 ao último dia do mês (o "período de fechamento em andamento" do spec). */
function quinzenaAtual(): { inicio: string; fim: string } {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  if (hoje.getDate() <= 15) {
    return { inicio: paraIso(new Date(ano, mes, 1)), fim: paraIso(new Date(ano, mes, 15)) };
  }
  return { inicio: paraIso(new Date(ano, mes, 16)), fim: paraIso(new Date(ano, mes + 1, 0)) };
}

// Duas casas: com uma só, ida 6,34 + volta 6,34 apareciam como 6,3 + 6,3 e o total (12,68) como 12,7.
const km = (valor: number | null) => (valor === null ? obterTextos().motorista.relatorio.naoCalculado : `${formatarNumero(valor, 2)} km`);

/**
 * Relatório quinzenal do motorista (HU17): as próprias entregas do período
 * com os valores usados no pagamento, pronto para impressão (RI11, `@media
 * print` em index.css) e com correção por linha. "Sem valor" significa que o valor
 * ainda não pôde ser calculado (ex.: tarifa não configurada) - nunca um zero.
 */
export function RelatorioQuinzenal() {
  const [periodo, setPeriodo] = useState(quinzenaAtual);
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [corrigindo, setCorrigindo] = useState<string | null>(null);
  const [verHistorico, setVerHistorico] = useState<string | null>(null);
  // Muda a cada correção salva, para o histórico aberto se recarregar.
  const [versaoHistorico, setVersaoHistorico] = useState(0);
  const textos = useTextos();
  const t = textos.motorista.relatorio;

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      setRelatorio(await consultarRelatorio(periodo.inicio, periodo.fim));
    } catch (excecao) {
      setRelatorio(null);
      setErro(excecao instanceof ApiError ? excecao.message : t.falhaCarregar);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Totais do período: só somam o que já tem valor (valor ausente não vira zero no total).
  const totais = relatorio?.entregas.reduce(
    (acc, item) => ({
      km: acc.km + (item.kmIda ?? 0) + (item.kmVolta ?? 0),
      valor: acc.valor + (item.tarifaAplicada ?? 0) + (item.valorPedagio ?? 0),
      semValor: acc.semValor + (item.tarifaAplicada === null ? 1 : 0),
    }),
    { km: 0, valor: 0, semValor: 0 },
  );

  return (
    <TelaMotorista titulo={t.titulo} navegacao>
      <div className="cartao nao-imprimir">
        <div className="linha-acoes" style={{ alignItems: "end" }}>
          <div>
            <label htmlFor="inicio">{t.de}</label>
            <input id="inicio" type="date" value={periodo.inicio} onChange={(e) => setPeriodo({ ...periodo, inicio: e.target.value })} />
          </div>
          <div>
            <label htmlFor="fim">{t.ate}</label>
            <input id="fim" type="date" value={periodo.fim} onChange={(e) => setPeriodo({ ...periodo, fim: e.target.value })} />
          </div>
        </div>
      </div>

      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {!relatorio && !erro && <Carregando texto={t.carregando} />}

      {relatorio && totais && (
        <>
          <p className="texto-apoio">{t.periodo(formatarData(periodo.inicio), formatarData(periodo.fim))}</p>
          {relatorio.entregas.length === 0 ? (
            <Vazio icone="documento" titulo={t.nenhuma}>
              {t.outrasDatas}
            </Vazio>
          ) : (
            <>
              <div className="resumo" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
                <span className="resumo-texto">
                  <small>{t.totalPeriodo}</small>
                  <span className="resumo-numero" style={{ fontSize: "2rem" }}>
                    {formatarMoeda(totais.valor)}
                  </span>
                </span>
                <span className="resumo-texto direita">
                  {t.viagens(relatorio.entregas.length)}
                  <small>{t.rodados(km(totais.km))}</small>
                </span>
              </div>
              {totais.semValor > 0 && <Alerta tipo="aviso">{t.semTarifa(totais.semValor)}</Alerta>}

              <ul className="lista mt-4">
                {relatorio.entregas.map((item) => (
                  // A mesma entrega pode aparecer duas vezes (tentativa sem sucesso e entrega concluída): a chave é a viagem.
                  <li key={item.viagemId} className="cartao">
                    <div className="cartao-cabecalho">
                      <span className="codigo">{item.bdoNumero ?? textos.motorista.geral.bdoSemNumero}</span>
                      {item.tentativaSemSucesso && <span className="selo">{t.tentativaSemSucesso}</span>}
                      {item.temAjuste && <span className="selo selo-aviso">{t.corrigido}</span>}
                    </div>
                    <dl className="dados-grade">
                      <div>
                        <dt>{t.ida}</dt>
                        <dd>{km(item.kmIda)}</dd>
                      </div>
                      <div>
                        <dt>{t.volta}</dt>
                        <dd>{km(item.kmVolta)}</dd>
                      </div>
                      <div>
                        <dt>{t.tarifa}</dt>
                        <dd>{formatarMoeda(item.tarifaAplicada)}</dd>
                      </div>
                      <div>
                        <dt>{t.pedagio}</dt>
                        <dd>{formatarMoeda(item.valorPedagio)}</dd>
                      </div>
                    </dl>
                    <div className="linha-acoes nao-imprimir mt-3">
                      <button
                        type="button"
                        className="secundario"
                        aria-expanded={corrigindo === item.viagemId}
                        onClick={() => setCorrigindo(corrigindo === item.viagemId ? null : item.viagemId)}
                      >
                        {t.corrigirValor}
                      </button>
                      {item.temAjuste && (
                        <button
                          type="button"
                          className="fantasma"
                          aria-expanded={verHistorico === item.viagemId}
                          onClick={() => setVerHistorico(verHistorico === item.viagemId ? null : item.viagemId)}
                        >
                          {t.verHistorico}
                        </button>
                      )}
                    </div>
                    {corrigindo === item.viagemId && (
                      <AjusteForm
                        viagemId={item.viagemId}
                        aoCancelar={() => setCorrigindo(null)}
                        aoSalvar={() => {
                          setCorrigindo(null);
                          setVerHistorico(item.viagemId);
                          setVersaoHistorico((v) => v + 1);
                          carregar();
                        }}
                      />
                    )}
                    {verHistorico === item.viagemId && <HistoricoAjustes key={versaoHistorico} viagemId={item.viagemId} />}
                  </li>
                ))}
              </ul>

              <button type="button" className="secundario bloco nao-imprimir mt-4" onClick={() => window.print()}>
                <Icone nome="impressora" /> {t.imprimir}
              </button>
            </>
          )}
        </>
      )}

      <Ajuda>
        <p>{t.ajuda}</p>
      </Ajuda>
    </TelaMotorista>
  );
}
