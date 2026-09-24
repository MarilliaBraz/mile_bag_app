import { Link, useParams } from "react-router-dom";
import { formatarData, formatarMoeda } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { detalharFechamento } from "./fechamentoApi";
import { FechamentoRelatorioCard } from "./FechamentoRelatorioCard";

/** Itens de um fechamento (HU12): os PENDENTE aparecem em destaque com o motivo, sem entrar nos totais (FR-006). */
export function DetalheFechamento() {
  const { fechamentoId } = useParams<{ fechamentoId: string }>();
  const { dados, erro, carregando } = useRecurso(() => detalharFechamento(fechamentoId ?? ""), "Não foi possível carregar o fechamento.");

  return (
    <main>
      <Link to="/admin/fechamentos">← Fechamentos</Link>
      {erro && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {erro}
        </p>
      )}
      {carregando && <p role="status">Carregando…</p>}

      {dados && (
        <>
          <h1>
            Fechamento {formatarData(dados.periodoInicio)} a {formatarData(dados.periodoFim)}
          </h1>
          {dados.status === "COM_PENDENCIAS" && (
            <p role="status" style={{ padding: "0.75rem", border: "1px solid var(--aviso)", borderRadius: 8, color: "var(--aviso)" }}>
              Há entregas pendentes neste fechamento. Corrija o que falta (ex.: cadastrar a tarifa) e gere de novo o período.
            </p>
          )}

          <FechamentoRelatorioCard fechamento={dados} />

          <h2>Itens ({dados.itens.length})</h2>
          {dados.itens.length === 0 ? (
            <p>Nenhuma entrega concluída neste período.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th>Motorista</th>
                  <th>Entrega</th>
                  <th>Pagamento</th>
                  <th>Pedágio</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {dados.itens.map((item) => {
                  const pendente = item.statusItem === "PENDENTE";
                  return (
                    <tr key={item.id} style={pendente ? { outline: "2px solid var(--aviso)", outlineOffset: -2 } : undefined}>
                      <td title={item.motoristaId}>{item.motoristaId.slice(0, 8)}</td>
                      <td title={item.entregaId}>{item.entregaId.slice(0, 8)}</td>
                      <td>{formatarMoeda(item.valorPagamentoEntrega)}</td>
                      <td>{formatarMoeda(item.valorReembolsoPedagio)}</td>
                      <td>{pendente ? `Pendente: ${item.motivoPendencia ?? "sem motivo informado"}` : "Calculado"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}
    </main>
  );
}
