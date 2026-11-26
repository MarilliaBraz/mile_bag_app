import { useCallback, useState } from "react";
import { formatarDataHora } from "../../../../shared/utils/formatar";
import { KmDaViagem } from "./KmDaViagem";
import { useRecurso } from "../../../../shared/hooks/useRecurso";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Alerta, Carregando, Vazio } from "../../../../shared/components/Alerta";
import { Icone } from "../../../../shared/components/Icone";
import { ConfirmarAcao } from "../../../../shared/components/ConfirmarAcao";
import { Gaveta, Pagina, Painel } from "../../../../shared/components/Pagina";
import type { EntregaStatus } from "../../../motorista/painel-entregas/types";
import { TOM_STATUS_ENTREGA } from "../../../motorista/painel-entregas/utils/statusEntrega";
import { baixarSegundaVia, consultarHistorico, enviarSegundaVia, listarEntregas } from "../services/entregasService";
import type { EntregaGestao } from "../types";
import { AlterarDadosBdo } from "./AlterarDadosBdo";
import { CancelarBdo } from "./CancelarBdo";
import { FotosDaMala } from "./FotosDaMala";
import { IncluirBdo } from "./IncluirBdo";
import { SegundaViaBdo } from "../../../../shared/components/SegundaViaBdo";
import { TrocarBaseBdo } from "./TrocarBaseBdo";
import { useIntervaloEmPrimeiroPlano } from "../../../../shared/hooks/useIntervaloEmPrimeiroPlano";
import { minutosParaVencer, priorizarPendentes } from "../utils/prioridadeBdo";
import { AGRUPAMENTOS, agruparLinhas, filtrarPorNumero, type Agrupamento, type GrupoLinhas } from "../utils/agruparLinhas";

const STATUS: EntregaStatus[] = ["AGUARDANDO_ATRIBUICAO", "ATRIBUIDA", "EM_ANDAMENTO", "REABERTA", "ENCERRADA_COM_SUCESSO", "CANCELADA"];

/** Item 8: o selo "Mesmo endereço" mostra até estes números; o resto vira "e mais N" (a lista toda fica no title). */
const NUMEROS_NO_SELO = 3;

/** O selo "faltam N min" e a ordem dos pendentes se atualizam a cada minuto. */
const RELOGIO_MS = 60_000;

/** V47/V59: só cabe cancelar ou corrigir os dados do passageiro do que ainda não foi concluído nem cancelado. */
const emAberto = (linha: EntregaGestao) => linha.status !== "ENCERRADA_COM_SUCESSO" && linha.status !== "CANCELADA";

/**
 * Entregas da empresa e a rastreabilidade de cada mala (V46): quem assumiu, viagens, ocorrências, dispensas e a
 * entrega, em ordem. A lista traz as 200 mais recentemente movimentadas; o filtro de situação age sobre ela.
 * V47: traz também os BDOs que ninguém assumiu, e a gaveta permite cancelar o BDO (com motivo e confirmação).
 * V49: "Incluir BDO" abre a inclusão pela empresa (colar o telex ou digitar os campos).
 */
export function TelaEntregas() {
  const textos = useTextos();
  const t = textos.backOffice.entregas;
  const rotuloStatus = textos.motorista.status;
  const { dados, erro, recarregar } = useRecurso(() => listarEntregas(null), t.falhaCarregar);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<EntregaStatus | "">("");
  const [busca, setBusca] = useState("");
  const [agruparPor, setAgruparPor] = useState<Agrupamento>("");
  const [aberta, setAberta] = useState<EntregaGestao | null>(null);
  const [incluindo, setIncluindo] = useState(false);
  const [estadoInclusao, setEstadoInclusao] = useState({ preenchido: false, ocupado: false });
  const [descartando, setDescartando] = useState(false);
  const aoMudarEstadoInclusao = useCallback((estado: { preenchido: boolean; ocupado: boolean }) => setEstadoInclusao(estado), []);
  const [agora, setAgora] = useState(() => Date.now());
  useIntervaloEmPrimeiroPlano(
    useCallback(() => setAgora(Date.now()), []),
    RELOGIO_MS,
  );

  /** Fechar a inclusão: nunca no meio do envio; com dados preenchidos, pergunta antes de descartar. */
  function fecharInclusao() {
    if (estadoInclusao.ocupado) {
      return;
    }
    if (estadoInclusao.preenchido) {
      setDescartando(true);
      return;
    }
    setIncluindo(false);
  }
  // BDO sem motorista além do prazo sobe para o topo; item 8: os do mesmo endereço ficam juntos, logo depois do primeiro.
  const filtradas = filtrarPorNumero(dados?.filter((entrega) => !filtro || entrega.status === filtro) ?? [], busca);
  const visiveis = agruparMesmoEndereco(priorizarPendentes(filtradas, agora));
  const grupos = agruparLinhas(visiveis, agruparPor);

  /** Título da faixa do grupo, no idioma da vez. */
  function tituloDoGrupo(grupo: GrupoLinhas): string {
    const nome =
      agruparPor === "status"
        ? rotuloStatus[grupo.chave as EntregaStatus]
        : grupo.chave || (agruparPor === "motorista" ? t.semMotorista : t.agrupar.semBase);
    return t.agrupar.grupo(nome, grupo.linhas.length);
  }

  return (
    <Pagina
      titulo={t.titulo}
      descricao={t.descricao}
      acoes={
        <button
          type="button"
          onClick={() => {
            setSucesso(null);
            setIncluindo(true);
          }}
        >
          <Icone nome="mais" /> {t.incluir.botao}
        </button>
      }
    >
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {sucesso && <Alerta tipo="sucesso">{sucesso}</Alerta>}
      {!dados && !erro && <Carregando texto={t.carregando} />}

      {dados && (
        <Painel titulo={t.titulo}>
          <div className="form-linha">
            <div>
              <label htmlFor="busca-bdo">{t.agrupar.buscar}</label>
              <input
                id="busca-bdo"
                type="search"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                placeholder={t.agrupar.buscarExemplo}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
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
            <div>
              <label htmlFor="agrupar-por">{t.agrupar.rotulo}</label>
              <select id="agrupar-por" value={agruparPor} onChange={(evento) => setAgruparPor(evento.target.value as Agrupamento)}>
                {AGRUPAMENTOS.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {t.agrupar.opcoes[opcao || "nenhum"]}
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
                {grupos.map((grupo) => (
                  <tbody key={grupo.chave || "todas"}>
                    {agruparPor && (
                      <tr className="linha-grupo">
                        <th scope="colgroup" colSpan={5}>
                          {tituloDoGrupo(grupo)}
                        </th>
                      </tr>
                    )}
                    {grupo.linhas.map((entrega) => (
                      <LinhaEntrega
                        key={entrega.bdoId}
                        entrega={entrega}
                        agora={agora}
                        aoAbrir={() => {
                          setSucesso(null);
                          setAberta(entrega);
                        }}
                      />
                    ))}
                  </tbody>
                ))}
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
            {/* V50: imprimir ou enviar por e-mail a segunda via, a qualquer momento. */}
            <SegundaViaBdo
              nomeArquivo={`BDO-${aberta.bdoNumero ?? aberta.bdoId.slice(0, 8)}.pdf`}
              baixar={() => baixarSegundaVia(aberta.bdoId)}
              enviar={(email) => enviarSegundaVia(aberta.bdoId, email)}
            />
            {/* V52: só antes de alguém assumir (sem motorista e disponível), e nunca a carona (vai com a principal). */}
            {!aberta.motoristaNome &&
              !aberta.bagagemCarona &&
              (aberta.status === "AGUARDANDO_ATRIBUICAO" || aberta.status === "REABERTA") && (
                <TrocarBaseBdo
                  linha={aberta}
                  aoTrocar={(codigo) => {
                    setSucesso(t.trocarBase.trocada(aberta.bdoNumero ?? t.semNumero, codigo));
                    setAberta(null);
                    void recarregar();
                  }}
                />
              )}
            {emAberto(aberta) && (
              <AlterarDadosBdo
                linha={aberta}
                aoAlterar={() => {
                  setSucesso(t.alterarDados.alterados(aberta.bdoNumero ?? t.semNumero));
                  setAberta(null);
                  void recarregar();
                }}
              />
            )}
            {emAberto(aberta) && (
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

      <Gaveta aberta={incluindo} largura="larga" titulo={t.incluir.titulo} descricao={t.incluir.descricao} aoFechar={fecharInclusao}>
        {incluindo && (
          <IncluirBdo
            aoMudarEstado={aoMudarEstadoInclusao}
            aoIncluir={(numero) => {
              setSucesso(t.incluir.incluido(numero));
              setIncluindo(false);
              void recarregar();
            }}
          />
        )}
      </Gaveta>

      <ConfirmarAcao
        aberto={descartando}
        titulo={t.incluir.descartarTitulo}
        descricao={t.incluir.descartarDescricao}
        rotuloConfirmar={t.incluir.descartarConfirmar}
        rotuloDesistir={textos.comum.voltar}
        perigo
        aoConfirmar={() => {
          setDescartando(false);
          setIncluindo(false);
        }}
        aoCancelar={() => setDescartando(false)}
      />
    </Pagina>
  );
}

/** Uma linha da grid: número (abre o histórico), selos, passageiro, motorista, situação e última movimentação. */
function LinhaEntrega({ entrega, agora, aoAbrir }: { entrega: EntregaGestao; agora: number; aoAbrir: () => void }) {
  const textos = useTextos();
  const t = textos.backOffice.entregas;
  const rotuloStatus = textos.motorista.status;
  return (
    <tr className={(minutosParaVencer(entrega, agora) ?? 1) <= 0 ? "linha-pendente" : undefined}>
      <td>
        <button type="button" className="fantasma compacto" aria-label={t.verHistorico(entrega.bdoNumero ?? t.semNumero)} onClick={aoAbrir}>
          <Icone nome="historico" /> <span className="codigo">{entrega.bdoNumero ?? t.semNumero}</span>
        </button>
        {entrega.bagagemCarona && <span className="selo selo-info">{t.carona}</span>}
        {entrega.corrigida && <span className="selo selo-aviso">{t.corrigida}</span>}
        {entrega.baseCodigo && <span className="selo selo-info codigo">{entrega.baseCodigo}</span>}
        <SeloPrazo minutos={minutosParaVencer(entrega, agora)} />
        {entrega.mesmoEnderecoQue && entrega.mesmoEnderecoQue.length > 0 && (
          <span className="selo selo-sucesso selo-quebra" title={entrega.mesmoEnderecoQue.join(", ")}>
            {t.mesmoEndereco(
              entrega.mesmoEnderecoQue.slice(0, NUMEROS_NO_SELO).join(", "),
              Math.max(0, entrega.mesmoEnderecoQue.length - NUMEROS_NO_SELO),
            )}
          </span>
        )}
      </td>
      <td>{entrega.passageiroNome ?? "—"}</td>
      <td>{entrega.motoristaNome ?? <span className="texto-apoio">{t.semMotorista}</span>}</td>
      <td>
        <span className={`selo selo-${TOM_STATUS_ENTREGA[entrega.status]}`}>{rotuloStatus[entrega.status]}</span>
      </td>
      <td>{formatarDataHora(entrega.atualizadoEm)}</td>
    </tr>
  );
}

/** BDO sem motorista: quanto falta para vencer o prazo de assumir, ou há quanto tempo está pendente. */
function SeloPrazo({ minutos }: { minutos: number | null }) {
  const t = useTextos().backOffice.entregas;
  if (minutos === null) {
    return null;
  }
  if (minutos <= 0) {
    return <span className="selo selo-erro">{t.pendente(Math.max(1, -minutos))}</span>;
  }
  return <span className="selo selo-info">{t.faltam(minutos)}</span>;
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
    <>
      <KmDaViagem viagens={dados.quilometragem ?? []} />
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
    </>
  );
}

/** A origem do BDO e quem recebeu vêm como códigos/nomes; o resto (motivos) já vem pronto para exibir. */
function descricaoDoEvento(
  tipo: string,
  descricao: string,
  t: {
    origens: Record<string, string>;
    recebidoPor: (quem: string) => string;
    enviadaPara: (email: string) => string;
    etapasCorrecao: Record<string, string>;
  },
): string {
  if (tipo === "BDO_RECEBIDO") {
    return t.origens[descricao] ?? descricao;
  }
  if (tipo === "ENTREGUE") {
    return t.recebidoPor(descricao);
  }
  if (tipo === "CORRECAO") {
    return t.etapasCorrecao[descricao] ?? descricao;
  }
  if (tipo === "SEGUNDA_VIA_ENVIADA") {
    return t.enviadaPara(descricao);
  }
  return descricao;
}

/** Item 8: mantém a ordem da lista, mas puxa os BDOs do mesmo endereço para logo depois do primeiro do grupo. */
function agruparMesmoEndereco(linhas: EntregaGestao[]): EntregaGestao[] {
  const porNumero = new Map(linhas.filter((linha) => linha.bdoNumero).map((linha) => [linha.bdoNumero as string, linha]));
  const colocadas = new Set<EntregaGestao>();
  const resultado: EntregaGestao[] = [];
  for (const linha of linhas) {
    if (colocadas.has(linha)) {
      continue;
    }
    resultado.push(linha);
    colocadas.add(linha);
    for (const numero of linha.mesmoEnderecoQue ?? []) {
      const outra = porNumero.get(numero);
      if (outra && !colocadas.has(outra)) {
        resultado.push(outra);
        colocadas.add(outra);
      }
    }
  }
  return resultado;
}
