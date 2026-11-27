import { useEffect, useState } from "react";
import { Alerta, Carregando } from "../../../../shared/components/Alerta";
import { Painel } from "../../../../shared/components/Pagina";
import { formatarDataHora, mensagemDeErro } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { baixarFotoEntrega, obterEntregaParceiro } from "../services/bagagensService";
import type { BagagemEncontrada, EntregaParceiro } from "../types";

/** Miniatura de uma foto da entrega: o arquivo exige autorização, então vira um endereço local do navegador. */
function FotoEntrega({ bagagemId, foto, rotulo }: { bagagemId: string; foto: EntregaParceiro["fotos"][number]; rotulo: string }) {
  const t = useTextos().companhia.entregaParceiro;
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let endereco: string | null = null;
    baixarFotoEntrega(bagagemId, foto.id).then(
      (arquivo) => {
        endereco = URL.createObjectURL(arquivo);
        setUrl(endereco);
      },
      () => setUrl(null),
    );
    return () => {
      if (endereco) URL.revokeObjectURL(endereco);
    };
  }, [bagagemId, foto.id]);
  return (
    <li className="foto-entrega">
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" aria-label={t.abrirFoto(rotulo)}>
          <img src={url} alt={rotulo} />
        </a>
      ) : (
        <span className="foto-entrega-carregando" aria-hidden="true" />
      )}
      <span className="texto-apoio">
        {rotulo}
        {foto.dataHora && ` · ${formatarDataHora(foto.dataHora)}`}
      </span>
    </li>
  );
}

/**
 * Painel da companhia, fase 2: a entrega do parceiro desta bagagem. Linha do tempo, alerta de tentativa sem sucesso
 * com o contato e o link de rastreio, e o comprovante com as fotos. Nada do motorista.
 */
export function EntregaParceiroPainel({ bagagem }: { bagagem: BagagemEncontrada }) {
  const t = useTextos().companhia.entregaParceiro;
  const [entrega, setEntrega] = useState<EntregaParceiro | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const etapa = bagagem.encaminhamento?.etapa;

  useEffect(() => {
    obterEntregaParceiro(bagagem.id).then(setEntrega, (excecao) => setErro(mensagemDeErro(excecao, t.falhaCarregar)));
  }, [bagagem.id, etapa, t.falhaCarregar]);

  async function copiar(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  if (erro) return <Alerta tipo="erro">{erro}</Alerta>;
  if (!entrega) return <Carregando />;

  const naoEntregue = entrega.etapa === "NAO_ENTREGUE";
  const passos = [
    { rotulo: t.encaminhada, quando: entrega.encaminhadoEm },
    { rotulo: t.coletada, quando: entrega.coletadoEm },
    naoEntregue ? { rotulo: t.naoEntregue, quando: entrega.naoEntregueEm } : { rotulo: t.entregue, quando: entrega.entregueEm },
  ];
  const { comprovante } = entrega;
  return (
    <Painel titulo={t.titulo} descricao={t.descricao}>
      <ol className="passos-entrega">
        {passos.map((passo) => (
          <li key={passo.rotulo} className={passo.quando ? "passo-feito" : undefined}>
            <strong>{passo.rotulo}</strong>
            <span className="texto-apoio">{passo.quando ? formatarDataHora(passo.quando) : t.pendente}</span>
          </li>
        ))}
      </ol>

      {naoEntregue && (
        <div className="alerta-nao-entregue" role="alert">
          <strong>{t.tentativaTitulo}</strong>
          {entrega.ultimaTentativa && (
            <span>
              {[entrega.ultimaTentativa.motivo, entrega.ultimaTentativa.observacao, formatarDataHora(entrega.ultimaTentativa.dataHora)]
                .filter(Boolean)
                .join(" · ")}
            </span>
          )}
          <span>{t.tentativaAjuda}</span>
        </div>
      )}

      <dl className="dados-grade">
        <div>
          <dt>{t.telefone}</dt>
          <dd>
            {entrega.telefonePassageiro ? <a href={`tel:${entrega.telefonePassageiro}`}>{entrega.telefonePassageiro}</a> : t.semContato}
          </dd>
        </div>
        <div>
          <dt>{t.email}</dt>
          <dd>{entrega.emailPassageiro ? <a href={`mailto:${entrega.emailPassageiro}`}>{entrega.emailPassageiro}</a> : t.semContato}</dd>
        </div>
        {entrega.linkAcompanhamento && (
          <div>
            <dt>{t.rastreio}</dt>
            <dd className="linha-acoes">
              <a href={entrega.linkAcompanhamento} target="_blank" rel="noreferrer">
                {entrega.linkAcompanhamento}
              </a>
              <button type="button" className="secundario compacto" onClick={() => void copiar(entrega.linkAcompanhamento as string)}>
                {t.copiar}
              </button>
              {copiado && <span role="status">{t.copiado}</span>}
            </dd>
          </div>
        )}
      </dl>

      <h3>{t.comprovante}</h3>
      {comprovante ? (
        <dl className="dados-grade">
          <div>
            <dt>{t.recebidoPor}</dt>
            <dd>{comprovante.nomeRecebedor ?? "–"}</dd>
          </div>
          <div>
            <dt>{t.tipoRecebedor}</dt>
            <dd>{comprovante.tipoRecebedor ?? "–"}</dd>
          </div>
          <div>
            <dt>{t.dataHora}</dt>
            <dd>{formatarDataHora(comprovante.dataHora)}</dd>
          </div>
          {comprovante.latitude !== null && comprovante.longitude !== null && (
            <div>
              <dt>{t.local}</dt>
              <dd>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${comprovante.latitude}&mlon=${comprovante.longitude}#map=18/${comprovante.latitude}/${comprovante.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.verMapa}
                </a>
              </dd>
            </div>
          )}
        </dl>
      ) : (
        <p className="texto-apoio">{t.semComprovante}</p>
      )}

      <h3>{t.fotos}</h3>
      {entrega.fotos.length === 0 ? (
        <p className="texto-apoio">{t.semFotos}</p>
      ) : (
        <ul className="fotos-entrega">
          {entrega.fotos.map((foto) => (
            <FotoEntrega key={foto.id} bagagemId={bagagem.id} foto={foto} rotulo={t.tiposFoto[foto.tipo] ?? foto.tipo} />
          ))}
        </ul>
      )}
    </Painel>
  );
}
