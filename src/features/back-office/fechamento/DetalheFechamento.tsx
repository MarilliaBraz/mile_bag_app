import { useParams } from "react-router-dom";
import { formatarData, formatarMoeda } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { useTextos } from "../../../shared/i18n/idioma";
import { listarMotoristas, nomeDoMotorista } from "../motoristas/motoristasApi";
import { detalharFechamento } from "./fechamentoApi";
import { FechamentoRelatorioCard } from "./FechamentoRelatorioCard";
import { Alerta, Carregando, Vazio } from "../../../shared/ui/Alerta";
import { Indicador, Pagina, Painel } from "../layout/Pagina";

/** Itens de um fechamento (HU12): os PENDENTE aparecem em destaque com o motivo, sem entrar nos totais (FR-006). */
export function DetalheFechamento() {
  const { fechamentoId } = useParams<{ fechamentoId: string }>();
  const textos = useTextos().backOffice;
  const t = textos.fechamentos;
  const { dados, erro, carregando } = useRecurso(() => detalharFechamento(fechamentoId ?? ""), t.falhaCarregarUm);

  const { dados: motoristas } = useRecurso(listarMotoristas, textos.motoristas.falhaCarregar);

  const pagamento = dados?.itens.reduce((soma, item) => soma + (item.valorPagamentoEntrega ?? 0), 0) ?? 0;
  const pedagio = dados?.itens.reduce((soma, item) => soma + (item.valorReembolsoPedagio ?? 0), 0) ?? 0;
  const pendentes = dados?.itens.filter((item) => item.statusItem === "PENDENTE").length ?? 0;

  return (
    <Pagina
      titulo={dados ? t.tituloDetalhe(t.periodo(formatarData(dados.periodoInicio), formatarData(dados.periodoFim))) : t.tituloSimples}
      voltarPara="/admin/fechamentos"
      rotuloVoltar={t.titulo}
    >
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {carregando && <Carregando texto={t.carregandoUm} />}

      {dados && (
        <>
          {dados.status === "COM_PENDENCIAS" && (
            <Alerta tipo="aviso">
              <strong>{t.temPendentes}</strong> {t.temPendentesDica}
            </Alerta>
          )}

          <div className="indicadores">
            <Indicador rotulo={t.pagamentoEntregas} valor={formatarMoeda(pagamento)} />
            <Indicador rotulo={t.reembolsoPedagios} valor={formatarMoeda(pedagio)} />
            <Indicador rotulo={t.entregas} valor={dados.itens.length} />
            <Indicador
              rotulo={t.pendentes}
              valor={pendentes}
              tom={pendentes > 0 ? "aviso" : "sucesso"}
              detalhe={pendentes > 0 ? t.foraTotais : t.tudoCalculado}
            />
          </div>

          <Painel titulo={t.relatoriosPdf} descricao={t.relatoriosPdfDescricao}>
            <FechamentoRelatorioCard fechamento={dados} />
          </Painel>

          <Painel titulo={t.entregasQuantas(dados.itens.length)} className="sem-recuo">
            {dados.itens.length === 0 ? (
              <div style={{ padding: "0 1.25rem 1.25rem" }}>
                <Vazio icone="documento" titulo={t.nenhumaEntrega} />
              </div>
            ) : (
              <div className="tabela-rolavel">
                <table className="tabela">
                  <thead>
                    <tr>
                      <th scope="col">{t.colunaMotorista}</th>
                      <th scope="col">{t.colunaEntrega}</th>
                      <th scope="col" className="numero">
                        {t.colunaPagamento}
                      </th>
                      <th scope="col" className="numero">
                        {t.colunaPedagio}
                      </th>
                      <th scope="col">{t.colunaSituacao}</th>
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
                            {item.tentativaSemSucesso && <div className="texto-apoio">{t.tentativaSemSucesso}</div>}
                          </td>
                          <td className="numero">{formatarMoeda(item.valorPagamentoEntrega)}</td>
                          <td className="numero">{formatarMoeda(item.valorReembolsoPedagio)}</td>
                          <td>
                            {pendente ? (
                              <>
                                <span className="selo selo-aviso">{t.pendente}</span>
                                <div className="texto-apoio">{item.motivoPendencia ?? t.semMotivo}</div>
                              </>
                            ) : (
                              <span className="selo selo-sucesso">{t.calculado}</span>
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
