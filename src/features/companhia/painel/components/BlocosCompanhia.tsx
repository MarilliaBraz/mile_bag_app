import { Link } from "react-router-dom";
import { Painel } from "../../../../shared/components/Pagina";
import { formatarDataHora } from "../../../../shared/utils/formatar";
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
