import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../../../shared/api/ApiError";
import { Alerta, Carregando } from "../../../../shared/ui/Alerta";
import { AvisoContatoIncompleto } from "../../../../shared/ui/AvisoContatoIncompleto";
import { AvisoJanelaReagendamento } from "../../../../shared/ui/AvisoJanelaReagendamento";
import { useTextos } from "../../../../shared/i18n/idioma";
import { Icone } from "../../../../shared/ui/Icone";
import { VincularBagagemCarona } from "../../captura-bdo/bagagem-carona/VincularBagagemCarona";
import { TelaMotorista } from "../../layout/TelaMotorista";
import { BotaoLigar } from "../../mensageria/components/BotaoLigar";
import { Conversa } from "../../mensageria/components/Conversa";
import { HistoricoOcorrencias } from "../../ocorrencia/HistoricoOcorrencias";
import { consultarDetalhe } from "../services/painelService";
import type { ItemPainelDetalhe } from "../types";
import { EtapasEntrega } from "./EtapasEntrega";
import { TOM_STATUS_ENTREGA } from "./statusEntrega";

/**
 * Detalhe completo de uma entrega (HU19, FR-003) - passageiro, endereço,
 * dados do BDO e bagagens carona vinculadas (HU05), com acesso à rota e
 * viagem (HU03/HU04), comprovante (HU06), ocorrência (HU07), ligação direta
 * (HU21) e conversa com o passageiro (HU18).
 *
 * <p>O que o motorista mais usa (rota, ligar, encerrar) fica no topo, em
 * botões grandes; os dados de conferência do BDO vêm depois.</p>
 */
export function DetalheEntrega() {
  const { entregaId } = useParams<{ entregaId: string }>();
  const [entrega, setEntrega] = useState<ItemPainelDetalhe | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const t = useTextos().motorista;

  const carregar = useCallback(() => {
    if (!entregaId) {
      return;
    }
    setErro(null);
    consultarDetalhe(entregaId)
      .then(setEntrega)
      .catch((excecao) => {
        setErro(excecao instanceof ApiError ? excecao.message : t.detalhe.falhaAoCarregar);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entregaId]);

  useEffect(() => {
    setEntrega(null);
    carregar();
  }, [carregar]);

  const encerrada = entrega?.status === "ENCERRADA_COM_SUCESSO";
  const status = entrega ? { texto: t.status[entrega.status], tom: TOM_STATUS_ENTREGA[entrega.status] } : null;

  return (
    <TelaMotorista titulo={entrega?.bdoNumero ?? t.detalhe.titulo} voltarPara="/motorista" rotuloVoltar={t.geral.voltarPainel}>
      {erro && (
        <Alerta tipo="erro">
          <p>{erro}</p>
          <button type="button" className="secundario" onClick={carregar}>
            <Icone nome="sincronizar" /> {t.geral.tentarDeNovo}
          </button>
        </Alerta>
      )}

      {!entrega && !erro && <Carregando texto={t.detalhe.carregando} />}

      {entrega && status && (
        <>
          <section className="cartao" aria-label={t.detalhe.destino}>
            <div className="cartao-cabecalho">
              <span className="texto-apoio">{t.detalhe.entregarPara}</span>
              <span className={`selo selo-${status.tom}`}>{status.texto}</span>
            </div>
            <div className="destino-nome">{entrega.passageiroNome ?? t.geral.passageiroNaoIdentificado}</div>
            <div className="linha-icone destino-endereco">
              <Icone nome="pino" />
              <span>{entrega.endereco ?? t.geral.enderecoNaoInformado}</span>
            </div>
            <AvisoJanelaReagendamento janela={entrega.janelaReagendamento} />
            <AvisoContatoIncompleto pendencias={entrega.pendenciasContato} compacto />
            <div className="divisor-topo">
              <EtapasEntrega entrega={entrega} />
            </div>
          </section>

          <div className="grade-acoes mt-4">
            <Link
              to={`/motorista/entregas/${entrega.entregaId}/rota`}
              viewTransition
              className={`botao grande${entrega.telefone ? "" : " largo"}`}
            >
              <Icone nome="rota" /> {entrega.temTrajetoIniciado ? t.detalhe.verViagem : t.detalhe.rota}
            </Link>
            <BotaoLigar telefone={entrega.telefone} />
            {!encerrada && (
              <>
                <Link to={`/motorista/entregas/${entrega.entregaId}/comprovante`} viewTransition className="botao grande sucesso largo">
                  <Icone nome="checkCirculo" /> {t.detalhe.registrarEntrega}
                </Link>
                <Link to={`/motorista/entregas/${entrega.entregaId}/ocorrencia`} viewTransition className="botao secundario largo">
                  <Icone nome="alerta" /> {t.detalhe.naoConsegui}
                </Link>
              </>
            )}
          </div>

          <h2>{t.detalhe.dadosBdo}</h2>
          <dl className="cartao dados-grade">
            <div>
              <dt>{t.detalhe.companhia}</dt>
              <dd>{entrega.companhiaAerea ?? t.detalhe.naoInformada}</dd>
            </div>
            <div>
              <dt>{t.detalhe.etiqueta}</dt>
              <dd className="codigo">{entrega.etiquetaBagagem ?? t.detalhe.naoInformada}</dd>
            </div>
            <div>
              <dt>{t.detalhe.telefone}</dt>
              <dd>{entrega.telefone ?? t.detalhe.naoInformado}</dd>
            </div>
            <div>
              <dt>{t.detalhe.numeroBdo}</dt>
              <dd className="codigo">{entrega.bdoNumero ?? t.detalhe.semNumero}</dd>
            </div>
          </dl>

          <VincularBagagemCarona
            entregaId={entrega.entregaId}
            bagagens={entrega.bagagensCarona}
            encerrada={encerrada}
            aoAlterar={carregar}
          />

          <HistoricoOcorrencias entregaId={entrega.entregaId} />

          {/* HU18: conversa com o passageiro (a ligação, HU21, fica nas ações do topo). */}
          <section>
            <h2>
              <Icone nome="conversa" /> {t.detalhe.conversa}
            </h2>
            <Conversa entregaId={entrega.entregaId} />
          </section>
        </>
      )}
    </TelaMotorista>
  );
}
