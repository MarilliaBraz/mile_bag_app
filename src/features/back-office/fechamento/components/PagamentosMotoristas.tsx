import { useState } from "react";
import { formatarMoeda } from "../../../../shared/utils/formatar";
import { useRecurso } from "../../../../shared/hooks/useRecurso";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { nomeDoMotorista } from "../../../../shared/services/motoristasService";
import type { Motorista } from "../../../../shared/types/motoristas";
import { Alerta, Carregando, Vazio } from "../../../../shared/components/Alerta";
import { Gaveta, Painel } from "../../../../shared/components/Pagina";
import { listarPagamentos } from "../services/fechamentoService";
import type { PagamentoMotorista } from "../types";
import { GerenciarPagamento } from "./GerenciarPagamento";
import { rotuloSituacao } from "../utils/pagamento";

const TOM_SITUACAO = { A_AGENDAR: "", AGENDADO: "selo-info", PAGO: "selo-sucesso" } as const;

/**
 * V60: a quinzena de cada motorista, paga de uma vez. A empresa agenda a data e marca como pago conforme for pagando;
 * a entrega paga sai da tela de Entregas e só volta pela busca do número do BDO.
 */
export function PagamentosMotoristas({ fechamentoId, motoristas }: { fechamentoId: string; motoristas: Motorista[] | null }) {
  const t = useTextos().backOffice.fechamentos.pagamentos;
  const { dados, erro, recarregar } = useRecurso(() => listarPagamentos(fechamentoId), t.falhaCarregar);
  const [aberto, setAberto] = useState<PagamentoMotorista | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  return (
    <Painel titulo={t.titulo} descricao={t.descricao} className="sem-recuo">
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {sucesso && <Alerta tipo="sucesso">{sucesso}</Alerta>}
      {!dados && !erro && <Carregando texto={t.carregando} />}
      {dados && dados.length === 0 && (
        <div style={{ padding: "0 1.25rem 1.25rem" }}>
          <Vazio icone="moeda" titulo={t.nenhum} />
        </div>
      )}
      {dados && dados.length > 0 && (
        <div className="tabela-rolavel">
          <table className="tabela">
            <thead>
              <tr>
                <th scope="col">{t.motorista}</th>
                <th scope="col" className="numero">
                  {t.entregas}
                </th>
                <th scope="col" className="numero">
                  {t.pedagios}
                </th>
                <th scope="col">{t.situacao}</th>
                <th scope="col" className="coluna-acoes">
                  <span className="visualmente-oculto">{t.acoes}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {dados.map((pagamento) => {
                const nome = nomeDoMotorista(motoristas, pagamento.motoristaId);
                return (
                  <tr key={pagamento.motoristaId}>
                    <td>
                      <strong>{nome}</strong>
                    </td>
                    <td className="numero">{formatarMoeda(pagamento.totalPagamentoEntregas)}</td>
                    <td className="numero">{formatarMoeda(pagamento.totalReembolsoPedagios)}</td>
                    <td>
                      <span className={`selo ${TOM_SITUACAO[pagamento.situacao]}`}>{rotuloSituacao(pagamento, t)}</span>
                    </td>
                    <td className="coluna-acoes">
                      <button
                        type="button"
                        className="secundario compacto"
                        aria-label={t.gerenciarDe(nome)}
                        onClick={() => {
                          setSucesso(null);
                          setAberto(pagamento);
                        }}
                      >
                        {t.gerenciar}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Gaveta
        aberta={aberto !== null}
        titulo={t.gavetaTitulo(aberto ? nomeDoMotorista(motoristas, aberto.motoristaId) : "")}
        descricao={
          aberto ? t.totais(formatarMoeda(aberto.totalPagamentoEntregas), formatarMoeda(aberto.totalReembolsoPedagios)) : undefined
        }
        aoFechar={() => setAberto(null)}
      >
        {aberto && (
          <GerenciarPagamento
            key={aberto.motoristaId}
            fechamentoId={fechamentoId}
            pagamento={aberto}
            aoAlterar={(mensagem) => {
              setSucesso(mensagem);
              setAberto(null);
              void recarregar();
            }}
          />
        )}
      </Gaveta>
    </Painel>
  );
}
