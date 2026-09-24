import { Fragment, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../../shared/api/ApiError";
import { AjusteForm } from "./AjusteForm";
import { HistoricoAjustes } from "./HistoricoAjustes";
import { consultarRelatorio, type RelatorioQuinzenal as Relatorio } from "./relatorioService";

const REAL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function paraIso(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

/** Quinzena em andamento: 1–15 ou 16–último dia do mês (o "período de fechamento em andamento" do spec). */
function quinzenaAtual(): { inicio: string; fim: string } {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  if (hoje.getDate() <= 15) {
    return { inicio: paraIso(new Date(ano, mes, 1)), fim: paraIso(new Date(ano, mes, 15)) };
  }
  return { inicio: paraIso(new Date(ano, mes, 16)), fim: paraIso(new Date(ano, mes + 1, 0)) };
}

const km = (valor: number | null) => (valor === null ? "—" : `${valor.toFixed(1).replace(".", ",")} km`);
const dinheiro = (valor: number | null) => (valor === null ? "—" : REAL.format(valor));
const dataBr = (iso: string) => iso.split("-").reverse().join("/");

/**
 * Relatório quinzenal do motorista (HU17): as próprias entregas do período
 * com os valores usados no pagamento, pronto para impressão (RI11, `@media
 * print` em index.css) e com correção por linha. "—" significa que o valor
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

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      setRelatorio(await consultarRelatorio(periodo.inicio, periodo.fim));
    } catch (excecao) {
      setRelatorio(null);
      setErro(excecao instanceof ApiError ? excecao.message : "Não foi possível carregar o relatório.");
    }
  }, [periodo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <main style={{ maxWidth: 760, margin: "2rem auto", padding: "0 1rem" }}>
      <Link to="/motorista" className="nao-imprimir">
        ← Voltar para o painel
      </Link>
      <h1>Relatório quinzenal</h1>

      <div className="nao-imprimir" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "end" }}>
        <div>
          <label htmlFor="inicio">De</label>
          <input id="inicio" type="date" value={periodo.inicio} onChange={(e) => setPeriodo({ ...periodo, inicio: e.target.value })} />
        </div>
        <div>
          <label htmlFor="fim">Até</label>
          <input id="fim" type="date" value={periodo.fim} onChange={(e) => setPeriodo({ ...periodo, fim: e.target.value })} />
        </div>
        <button onClick={() => window.print()} disabled={!relatorio || relatorio.entregas.length === 0}>
          🖨️ Imprimir
        </button>
      </div>

      {erro && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {erro}
        </p>
      )}
      {!relatorio && !erro && <p role="status">Carregando…</p>}

      {relatorio && (
        <>
          <p style={{ fontSize: "0.9rem" }}>
            Período: {dataBr(periodo.inicio)} a {dataBr(periodo.fim)}
          </p>
          {relatorio.entregas.length === 0 ? (
            <p>Nenhuma entrega encerrada neste período.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid var(--borda)" }}>
                  <th>BDO</th>
                  <th>Ida</th>
                  <th>Volta</th>
                  <th>Tarifa</th>
                  <th>Pedágio</th>
                  <th className="nao-imprimir" />
                </tr>
              </thead>
              <tbody>
                {relatorio.entregas.map((item) => (
                  <Fragment key={item.entregaId}>
                    <tr style={{ borderBottom: "1px solid var(--borda)" }}>
                      <td>
                        {item.bdoNumero ?? "—"}
                        {item.temAjuste && <span style={{ fontSize: "0.75rem", color: "var(--aviso)" }}> · corrigido</span>}
                      </td>
                      <td>{km(item.kmIda)}</td>
                      <td>{km(item.kmVolta)}</td>
                      <td>{dinheiro(item.tarifaAplicada)}</td>
                      <td>{dinheiro(item.valorPedagio)}</td>
                      <td className="nao-imprimir" style={{ whiteSpace: "nowrap" }}>
                        <button className="secundario" onClick={() => setCorrigindo(corrigindo === item.viagemId ? null : item.viagemId)}>
                          Corrigir
                        </button>{" "}
                        {item.temAjuste && (
                          <button className="secundario" onClick={() => setVerHistorico(verHistorico === item.viagemId ? null : item.viagemId)}>
                            Histórico
                          </button>
                        )}
                      </td>
                    </tr>
                    {(corrigindo === item.viagemId || verHistorico === item.viagemId) && (
                      <tr className="nao-imprimir">
                        <td colSpan={6}>
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
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </main>
  );
}
