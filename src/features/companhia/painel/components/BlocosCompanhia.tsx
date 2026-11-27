import { Link } from "react-router-dom";
import { Painel } from "../../../../shared/components/Pagina";
import { CartaoIndicador } from "../../../../shared/components/CartaoIndicador";
import { formatarDataHora, formatarMoeda, formatarNumero } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { formatarDuracao, formatarPercentual } from "../../../back-office/painel/utils/formatarPainel";
import type { PainelCompanhiaGestao } from "../types";

const VISIVEIS = 8;
const URGENTES = new Set(["ESTOURADO", "NAO_ENTREGUE"]);

/** Prazo da ANAC (semáforo), resolução em 24 h e os dois tempos: o da companhia e o do parceiro. */
export function MetasCompanhia({ painel }: { painel: PainelCompanhiaGestao }) {
  const t = useTextos().companhia.painelGestao;
  const { regulatorio, tempos } = painel;
  return (
    <section className="cockpit-metas" aria-label={t.prazoAnac}>
      <div className="cartao-otd cartao-semaforo">
        <div className="cartao-otd-texto">
          <span className="cartao-meta-rotulo">{t.prazoAnac}</span>
          <ul className="semaforo">
            <li>
              <span className="semaforo-ponto semaforo-verde" aria-hidden="true" />
              <strong>{regulatorio.noPrazo}</strong> {t.noPrazo}
            </li>
            <li>
              <span className="semaforo-ponto semaforo-ambar" aria-hidden="true" />
              <strong>{regulatorio.atencao}</strong> {t.atencao}
            </li>
            <li>
              <span className="semaforo-ponto semaforo-vermelho" aria-hidden="true" />
              <strong>{regulatorio.estourados}</strong> {t.estourados}
            </li>
          </ul>
          <span className="semaforo-ajuda">{t.prazoAnacAjuda}</span>
        </div>
      </div>
      <div className="cartao-meta">
        <span className="cartao-meta-rotulo">{t.resolucao24h}</span>
        <span className="cartao-meta-valor">{formatarPercentual(tempos.resolucao24h)}</span>
        <span />
        <span className="texto-apoio">{t.resolucao24hAjuda(tempos.entregues30Dias)}</span>
      </div>
      <div className="cartao-meta">
        <span className="cartao-meta-rotulo">{t.localizacao}</span>
        <span className="cartao-meta-valor">{formatarDuracao(tempos.localizacaoMinutos)}</span>
        <span />
        <span className="texto-apoio">{t.localizacaoAjuda}</span>
      </div>
      <div className="cartao-meta">
        <span className="cartao-meta-rotulo">{t.entrega}</span>
        <span className="cartao-meta-valor">{formatarDuracao(tempos.entregaMinutos)}</span>
        <span />
        <span className="texto-apoio">{t.entregaAjuda}</span>
      </div>
    </section>
  );
}

/** A cadeia de custódia numa barra só: da sala de bagagens à porta do passageiro. */
export function CustodiaCompanhia({ painel }: { painel: PainelCompanhiaGestao }) {
  const t = useTextos().companhia.painelGestao;
  const { custodia } = painel;
  const partes = [
    { chave: "sala", rotulo: t.naSala, valor: custodia.naSala, classe: "funil-aguardando" },
    { chave: "coleta", rotulo: t.aguardandoColeta, valor: custodia.aguardandoColeta, classe: "funil-coleta" },
    { chave: "rota", rotulo: t.emRota, valor: custodia.emRota, classe: "funil-transito" },
    { chave: "entregues", rotulo: t.entreguesHoje, valor: custodia.entreguesHoje, classe: "funil-entregues" },
    { chave: "nao", rotulo: t.naoEntregues, valor: custodia.naoEntregues, classe: "funil-erro" },
  ];
  const total = partes.reduce((soma, parte) => soma + parte.valor, 0);
  return (
    <Painel titulo={t.custodia}>
      {total === 0 ? (
        <p className="texto-apoio">{t.custodiaVazia}</p>
      ) : (
        <div className="barra-funil" aria-hidden="true">
          {partes
            .filter((parte) => parte.valor > 0)
            .map((parte) => (
              <span key={parte.chave} className={parte.classe} style={{ flexGrow: parte.valor }}>
                {parte.valor}
              </span>
            ))}
        </div>
      )}
      <ul className="legenda-funil">
        {partes.map((parte) => (
          <li key={parte.chave}>
            <span className={`ponto-funil ${parte.classe}`} aria-hidden="true" />
            {parte.rotulo}: <strong>{parte.valor}</strong>
          </li>
        ))}
      </ul>
    </Painel>
  );
}

/** Processos que pedem ação agora; vermelho só quando há algo na lista. */
export function AgirAgoraCompanhia({ painel }: { painel: PainelCompanhiaGestao }) {
  const t = useTextos().companhia.painelGestao;
  const itens = painel.agirAgora;
  return (
    <Painel titulo={t.agirAgora} className={itens.length > 0 ? "agir-agora agir-agora-ativo" : "agir-agora"}>
      {itens.length === 0 ? (
        <p className="texto-apoio">{t.agirAgoraVazio}</p>
      ) : (
        <ul className="lista-agir">
          {itens.slice(0, VISIVEIS).map((item) => (
            <li key={`${item.motivo}-${item.bagagemId}`}>
              <Link
                to={`/companhia/bagagens/${item.bagagemId}`}
                state={{ voltar: "/companhia/painel" }}
                className={URGENTES.has(item.motivo) ? "agir-urgente" : "agir-atencao"}
              >
                <span className="agir-linha">
                  <span className="agir-motivo">{t.motivos[item.motivo]}</span>
                  {item.aeroporto && <span className="texto-apoio">{item.aeroporto}</span>}
                </span>
                {item.processo && <strong className="codigo">{item.processo}</strong>}
                <span className="texto-apoio">
                  {[
                    item.passageiro,
                    item.empresa,
                    item.referencia &&
                      (item.motivo === "ESTOURADO" || item.motivo === "ATENCAO"
                        ? t.prazoEm(formatarDataHora(item.referencia))
                        : t.desde(formatarDataHora(item.referencia))),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {itens.length > VISIVEIS && <p className="texto-apoio">{t.agirAgoraMais(itens.length - VISIVEIS)}</p>}
    </Painel>
  );
}

/** Por aeroporto: onde as malas estão presas e quanto o parceiro demora para entregar. */
export function AeroportosCompanhia({ painel }: { painel: PainelCompanhiaGestao }) {
  const t = useTextos().companhia.painelGestao;
  return (
    <Painel titulo={t.aeroportos} className="secao-painel">
      {painel.aeroportos.length === 0 ? (
        <p className="texto-apoio">{t.aeroportosVazio}</p>
      ) : (
        <div className="tabela-rolavel">
          <table className="tabela">
            <thead>
              <tr>
                <th scope="col">{t.colAeroporto}</th>
                <th scope="col">{t.colNaSala}</th>
                <th scope="col">{t.colAguardando}</th>
                <th scope="col">{t.colEmRota}</th>
                <th scope="col">{t.colNaoEntregues}</th>
                <th scope="col">{t.colEstourados}</th>
                <th scope="col">{t.colEntrega}</th>
              </tr>
            </thead>
            <tbody>
              {painel.aeroportos.map((aeroporto) => (
                <tr key={aeroporto.codigo || t.semAeroporto}>
                  <th scope="row">{aeroporto.codigo || t.semAeroporto}</th>
                  <td>{aeroporto.naSala}</td>
                  <td>{aeroporto.aguardandoColeta}</td>
                  <td>{aeroporto.emRota}</td>
                  <td className={aeroporto.naoEntregues > 0 ? "numero-erro" : undefined}>{aeroporto.naoEntregues}</td>
                  <td className={aeroporto.estourados > 0 ? "numero-erro" : undefined}>{aeroporto.estourados}</td>
                  <td>{formatarDuracao(aeroporto.entregaMinutos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Painel>
  );
}

/** Fase 2: SLA por transportadora e aeroporto (30 dias); o pior tempo de entrega primeiro. */
export function ParceirosCompanhia({ painel }: { painel: PainelCompanhiaGestao }) {
  const t = useTextos().companhia.painelGestao;
  return (
    <Painel titulo={t.parceiros} descricao={t.parceirosDescricao} className="secao-painel">
      {painel.parceiros.length === 0 ? (
        <p className="texto-apoio">{t.parceirosVazio}</p>
      ) : (
        <div className="tabela-rolavel">
          <table className="tabela">
            <thead>
              <tr>
                <th scope="col">{t.colTransportadora}</th>
                <th scope="col">{t.colAeroporto}</th>
                <th scope="col">{t.colEntregues}</th>
                <th scope="col">{t.colColeta}</th>
                <th scope="col">{t.colEntregaMedia}</th>
                <th scope="col">{t.colEm24h}</th>
                <th scope="col">{t.colNaoEntregues}</th>
                <th scope="col">{t.colEmAberto}</th>
              </tr>
            </thead>
            <tbody>
              {painel.parceiros.map((parceiro) => (
                <tr key={`${parceiro.empresa}-${parceiro.aeroporto}`}>
                  <th scope="row">{parceiro.empresa || "–"}</th>
                  <td>{parceiro.aeroporto || t.semAeroporto}</td>
                  <td>{parceiro.entregues}</td>
                  <td>{formatarDuracao(parceiro.coletaMinutos)}</td>
                  <td>{formatarDuracao(parceiro.entregaMinutos)}</td>
                  <td>{formatarPercentual(parceiro.resolucao24h)}</td>
                  <td className={parceiro.naoEntregues > 0 ? "numero-erro" : undefined}>{parceiro.naoEntregues}</td>
                  <td>{parceiro.emAberto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Painel>
  );
}

/** Fase 3: custos dos processos (30 dias) e quanto se economiza resolvendo em até 24 h. */
export function FinanceiroCompanhia({ painel }: { painel: PainelCompanhiaGestao }) {
  const t = useTextos().companhia.painelGestao;
  const { financeiro } = painel;
  const dinheiro = (valor: number | null) => (valor === null ? "–" : formatarMoeda(valor));
  const tipos = Object.entries(financeiro.porTipo).filter(([, valor]) => (valor ?? 0) > 0);
  return (
    <section className="secao-painel pilha" aria-labelledby="financeiro-titulo">
      <div>
        <h2 id="financeiro-titulo">{t.financeiro}</h2>
        <p className="texto-apoio">{t.financeiroDescricao}</p>
      </div>
      <div className="indicadores">
        <CartaoIndicador
          rotulo={t.custoTotal}
          valor={formatarMoeda(financeiro.total)}
          detalhe={
            tipos.length > 0 ? tipos.map(([tipo, valor]) => `${t.tiposCusto[tipo]}: ${formatarMoeda(valor ?? 0)}`).join(" · ") : undefined
          }
        />
        <CartaoIndicador
          rotulo={t.custoPorProcesso}
          valor={dinheiro(financeiro.porProcesso)}
          detalhe={t.custoPorProcessoAjuda(financeiro.processos)}
        />
        <CartaoIndicador
          rotulo={t.economia24h}
          valor={
            financeiro.porProcessoAte24h !== null && financeiro.porProcessoAcima24h !== null
              ? formatarMoeda(financeiro.porProcessoAcima24h - financeiro.porProcessoAte24h)
              : "–"
          }
          detalhe={t.economia24hAjuda(dinheiro(financeiro.porProcessoAte24h), dinheiro(financeiro.porProcessoAcima24h))}
          tom="sucesso"
        />
      </div>
    </section>
  );
}

/** Fase 3: NPS e respostas da pesquisa do passageiro (30 dias). */
export function SatisfacaoCompanhia({ painel }: { painel: PainelCompanhiaGestao }) {
  const t = useTextos().companhia.painelGestao;
  const { satisfacao } = painel;
  const npsTom = satisfacao.nps === null ? undefined : satisfacao.nps >= 50 ? "sucesso" : satisfacao.nps >= 0 ? "aviso" : "erro";
  return (
    <section className="secao-painel pilha" aria-labelledby="satisfacao-titulo">
      <div>
        <h2 id="satisfacao-titulo">{t.satisfacao}</h2>
        <p className="texto-apoio">{satisfacao.respostas === 0 ? t.semRespostas : t.satisfacaoDescricao}</p>
      </div>
      <div className="indicadores">
        <CartaoIndicador
          rotulo={t.nps}
          valor={satisfacao.nps === null ? "–" : formatarNumero(satisfacao.nps, 0)}
          detalhe={t.npsAjuda(satisfacao.respostas)}
          tom={npsTom}
        />
        <CartaoIndicador rotulo={t.notaMedia} valor={satisfacao.notaMedia === null ? "–" : formatarNumero(satisfacao.notaMedia, 1)} />
        <CartaoIndicador
          rotulo={t.cordialidade}
          valor={satisfacao.cordialidadeMedia === null ? "–" : `${formatarNumero(satisfacao.cordialidadeMedia, 1)} / 5`}
        />
        <CartaoIndicador rotulo={t.malasDanificadas} valor={satisfacao.malasDanificadas} tom="erro" />
      </div>
    </section>
  );
}
