import { useState } from "react";
import { formatarDataHora } from "../../../../shared/utils/formatar";
import { useRecurso } from "../../../../shared/hooks/useRecurso";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Alerta, Carregando, Vazio } from "../../../../shared/components/Alerta";
import { Icone } from "../../../../shared/components/Icone";
import { Gaveta, Pagina, Painel } from "../../../../shared/components/Pagina";
import type { EntregaStatus } from "../../../motorista/painel-entregas/types";
import { TOM_STATUS_ENTREGA } from "../../../motorista/painel-entregas/utils/statusEntrega";
import { consultarHistorico, listarEntregas } from "../services/entregasService";
import type { EntregaGestao } from "../types";
import { CancelarBdo } from "./CancelarBdo";
import { FotosDaMala } from "./FotosDaMala";

const STATUS: EntregaStatus[] = ["AGUARDANDO_ATRIBUICAO", "ATRIBUIDA", "EM_ANDAMENTO", "REABERTA", "ENCERRADA_COM_SUCESSO", "CANCELADA"];

/** V47: só cabe cancelar o que ainda não foi concluído nem cancelado. */
const podeCancelar = (linha: EntregaGestao) => linha.status !== "ENCERRADA_COM_SUCESSO" && linha.status !== "CANCELADA";

/**
 * Entregas da empresa e a rastreabilidade de cada mala (V46): quem assumiu, viagens, ocorrências, dispensas e a
 * entrega, em ordem. A lista traz as 200 mais recentemente movimentadas; o filtro de situação age sobre ela.
 * V47: traz também os BDOs que ninguém assumiu, e a gaveta permite cancelar o BDO (com motivo e confirmação).
 */
export function TelaEntregas() {
  const textos = useTextos();
  const t = textos.backOffice.entregas;
  const rotuloStatus = textos.motorista.status;
  const { dados, erro, recarregar } = useRecurso(() => listarEntregas(null), t.falhaCarregar);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<EntregaStatus | "">("");
  const [aberta, setAberta] = useState<EntregaGestao | null>(null);
  const visiveis = dados?.filter((entrega) => !filtro || entrega.status === filtro) ?? [];

  return (
    <Pagina titulo={t.titulo} descricao={t.descricao}>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {sucesso && <Alerta tipo="sucesso">{sucesso}</Alerta>}
      {!dados && !erro && <Carregando texto={t.carregando} />}

      {dados && (
        <Painel titulo={t.titulo}>
          <div className="form-linha">
            <div>
              <label htmlFor="filtro-status">{t.filtroStatus}</label>
              <select id="filtro-status" value={filtro} onChange={(evento) => setFiltro(evento.target.value as EntregaStatus | "")}>
                <option value="">{t.todas}</option>
                {STATUS.map((status) => (
                  <option key={status} value={status}>
                    {rotuloStatus[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {visiveis.length === 0 ? (
            <Vazio icone="mala" titulo={t.nenhuma} />
          ) : (
            <div className="tabela-rolavel">
              <table className="tabela">
                <thead>
                  <tr>
                    <th scope="col">BDO</th>
                    <th scope="col">{t.passageiro}</th>
                    <th scope="col">{t.motorista}</th>
                    <th scope="col">{t.filtroStatus}</th>
                    <th scope="col">{t.atualizadaEm}</th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((entrega) => (
                    <tr key={entrega.bdoId}>
                      <td>
                        <button
                          type="button"
                          className="fantasma compacto"
                          aria-label={t.verHistorico(entrega.bdoNumero ?? t.semNumero)}
                          onClick={() => {
                            setSucesso(null);
                            setAberta(entrega);
                          }}
                        >
                          <Icone nome="historico" /> <span className="codigo">{entrega.bdoNumero ?? t.semNumero}</span>
                        </button>
                        {entrega.bagagemCarona && <span className="selo selo-info">{t.carona}</span>}
                      </td>
                      <td>{entrega.passageiroNome ?? "—"}</td>
                      <td>{entrega.motoristaNome ?? <span className="texto-apoio">{t.semMotorista}</span>}</td>
                      <td>
                        <span className={`selo selo-${TOM_STATUS_ENTREGA[entrega.status]}`}>{rotuloStatus[entrega.status]}</span>
                      </td>
                      <td>{formatarDataHora(entrega.atualizadoEm)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Painel>
      )}

      <Gaveta
        aberta={aberta !== null}
        largura="larga"
        titulo={t.historicoTitulo(aberta?.bdoNumero ?? t.semNumero)}
        descricao={aberta?.endereco ?? undefined}
        aoFechar={() => setAberta(null)}
      >
        {aberta && (
          <div className="pilha" key={aberta.bdoId}>
            {aberta.entregaId ? (
              <>
                <HistoricoMala entregaId={aberta.entregaId} />
                <FotosDaMala entregaId={aberta.entregaId} />
              </>
            ) : (
              <p className="texto-apoio">{t.semEntregaTexto}</p>
            )}
            {podeCancelar(aberta) && (
              <CancelarBdo
                linha={aberta}
                aoCancelar={() => {
                  setSucesso(t.cancelado(aberta.bdoNumero ?? t.semNumero));
                  setAberta(null);
                  void recarregar();
                }}
                aoFalhar={() => void recarregar()}
              />
            )}
          </div>
        )}
      </Gaveta>
    </Pagina>
  );
}

/** A linha do tempo de uma mala, carregada ao abrir a gaveta. */
function HistoricoMala({ entregaId }: { entregaId: string }) {
  const t = useTextos().backOffice.entregas;
  const { dados, erro } = useRecurso(() => consultarHistorico(entregaId), t.falhaHistorico);

  if (erro) {
    return <Alerta tipo="erro">{erro}</Alerta>;
  }
  if (!dados) {
    return <Carregando texto={t.carregandoHistorico} />;
  }
  return (
    <ul className="linha-tempo">
      {dados.eventos.map((evento, indice) => (
        <li key={`${evento.tipo}-${indice}`}>
          <strong>{t.eventos[evento.tipo]}</strong>
          <div className="texto-apoio">
            {evento.dataHora ? formatarDataHora(evento.dataHora) : "—"}
            {evento.motoristaNome && ` · ${evento.motoristaNome}`}
          </div>
          {evento.descricao && <div>{descricaoDoEvento(evento.tipo, evento.descricao, t)}</div>}
          {evento.detalhe && <div className="texto-apoio">{evento.detalhe}</div>}
        </li>
      ))}
    </ul>
  );
}

/** A origem do BDO e quem recebeu vêm como códigos/nomes; o resto (motivos) já vem pronto para exibir. */
function descricaoDoEvento(
  tipo: string,
  descricao: string,
  t: { origens: Record<string, string>; recebidoPor: (quem: string) => string },
): string {
  if (tipo === "BDO_RECEBIDO") {
    return t.origens[descricao] ?? descricao;
  }
  if (tipo === "ENTREGUE") {
    return t.recebidoPor(descricao);
  }
  return descricao;
}
