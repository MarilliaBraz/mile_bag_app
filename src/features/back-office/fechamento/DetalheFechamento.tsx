import { useParams } from "react-router-dom";
import { formatarData, formatarMoeda } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { listarMotoristas, nomeDoMotorista } from "../motoristas/motoristasApi";
import { detalharFechamento } from "./fechamentoApi";
import { FechamentoRelatorioCard } from "./FechamentoRelatorioCard";
import { Alerta, Carregando, Vazio } from "../../../shared/ui/Alerta";
import { Indicador, Pagina, Painel } from "../layout/Pagina";

/** Itens de um fechamento (HU12): os PENDENTE aparecem em destaque com o motivo, sem entrar nos totais (FR-006). */
export function DetalheFechamento() {
  const { fechamentoId } = useParams<{ fechamentoId: string }>();
  const { dados, erro, carregando } = useRecurso(() => detalharFechamento(fechamentoId ?? ""), "Não foi possível carregar o fechamento.");

  const { dados: motoristas } = useRecurso(listarMotoristas, "Não foi possível carregar os motoristas.");

  const pagamento = dados?.itens.reduce((soma, item) => soma + (item.valorPagamentoEntrega ?? 0), 0) ?? 0;
  const pedagio = dados?.itens.reduce((soma, item) => soma + (item.valorReembolsoPedagio ?? 0), 0) ?? 0;
  const pendentes = dados?.itens.filter((item) => item.statusItem === "PENDENTE").length ?? 0;

  return (
    <Pagina
      titulo={dados ? `Fechamento ${formatarData(dados.periodoInicio)} a ${formatarData(dados.periodoFim)}` : "Fechamento"}
      voltarPara="/admin/fechamentos"
      rotuloVoltar="Fechamentos"
    >
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {carregando && <Carregando texto="Carregando fechamento…" />}

      {dados && (
        <>
          {dados.status === "COM_PENDENCIAS" && (
            <Alerta tipo="aviso">
              <strong>Há entregas pendentes neste fechamento.</strong> Elas não entram nos totais. Corrija o que falta (ex.: cadastrar a tarifa) e gere de novo o período.
            </Alerta>
          )}

          <div className="indicadores">
            <Indicador rotulo="Pagamento de entregas" valor={formatarMoeda(pagamento)} />
            <Indicador rotulo="Reembolso de pedágios" valor={formatarMoeda(pedagio)} />
            <Indicador rotulo="Entregas" valor={dados.itens.length} />
            <Indicador rotulo="Pendentes" valor={pendentes} tom={pendentes > 0 ? "aviso" : "sucesso"} detalhe={pendentes > 0 ? "Fora dos totais" : "Tudo calculado"} />
          </div>

          <Painel titulo="Relatórios em PDF" descricao="Pagamento e pedágio saem sempre em arquivos separados, com a identidade visual da empresa.">
            <FechamentoRelatorioCard fechamento={dados} />
          </Painel>

          <Painel titulo={`Entregas (${dados.itens.length})`} className="sem-recuo">
            {dados.itens.length === 0 ? (
              <div style={{ padding: "0 1.25rem 1.25rem" }}>
                <Vazio icone="documento" titulo="Nenhuma entrega concluída neste período" />
              </div>
            ) : (
              <div className="tabela-rolavel">
                <table className="tabela">
                  <thead>
                    <tr>
                      <th scope="col">Motorista</th>
                      <th scope="col">Entrega</th>
                      <th scope="col" className="numero">Pagamento</th>
                      <th scope="col" className="numero">Pedágio</th>
                      <th scope="col">Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.itens.map((item) => {
                      const pendente = item.statusItem === "PENDENTE";
                      return (
                        <tr key={item.id} className={pendente ? "linha-pendente" : undefined}>
                          <td title={item.motoristaId}>
                            <strong>{nomeDoMotorista(motoristas, item.motoristaId)}</strong>
                          </td>
                          <td title={item.entregaId}>
                            <span className="codigo">{item.entregaId.slice(0, 8)}</span>
                          </td>
                          <td className="numero">{formatarMoeda(item.valorPagamentoEntrega)}</td>
                          <td className="numero">{formatarMoeda(item.valorReembolsoPedagio)}</td>
                          <td>
                            {pendente ? (
                              <>
                                <span className="selo selo-aviso">Pendente</span>
                                <div className="texto-apoio">{item.motivoPendencia ?? "Sem motivo informado"}</div>
                              </>
                            ) : (
                              <span className="selo selo-sucesso">Calculado</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Painel>
        </>
      )}
    </Pagina>
  );
}
