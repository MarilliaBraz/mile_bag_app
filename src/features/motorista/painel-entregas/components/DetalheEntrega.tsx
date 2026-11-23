import { formatarHora } from "../../../../shared/utils/formatar";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../../../shared/services/ApiError";
import { Alerta, Carregando } from "../../../../shared/components/Alerta";
import { AvisoContatoIncompleto } from "../../../../shared/components/AvisoContatoIncompleto";
import { SegundaViaBdo } from "../../../../shared/components/SegundaViaBdo";
import { AvisoJanelaReagendamento } from "../../../../shared/components/AvisoJanelaReagendamento";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Icone } from "../../../../shared/components/Icone";
import { VincularBagagemCarona } from "../bagagem-carona/components/VincularBagagemCarona";
import { TelaMotorista } from "../../../../shared/components/TelaMotorista";
import { BotaoLigar } from "../mensageria/components/BotaoLigar";
import { Conversa } from "../mensageria/components/Conversa";
import { HistoricoDispensas } from "./HistoricoDispensas";
import { HistoricoOcorrencias } from "./HistoricoOcorrencias";
import { consultarDetalhe, baixarSegundaViaDaEntrega, enviarSegundaViaDaEntrega } from "../services/painelService";
import type { ItemPainelDetalhe } from "../types";
import { EtapasEntrega } from "./EtapasEntrega";
import { temRetiradaLocal } from "../../../../shared/utils/retiradaLocal";
import { entregaEmViagem } from "../../../../shared/utils/viagemEmAndamento";
import { TOM_STATUS_ENTREGA } from "../utils/statusEntrega";

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
  // V48: assumida e ainda sem retirada (foto da bagagem no aeroporto), a próxima ação é retirar - antes da viagem.
  const precisaRetirar =
    !!entrega &&
    entrega.status === "ATRIBUIDA" &&
    !entrega.retiradaRegistrada &&
    !entrega.temTrajetoIniciado &&
    !temRetiradaLocal(entrega.entregaId);
  const status = entrega ? { texto: t.status[entrega.status], tom: TOM_STATUS_ENTREGA[entrega.status] } : null;
  // Sem viagem iniciada o servidor recusa o comprovante: o motorista tirava todas as fotos e só no fim descobria
  // (GYNLA25237). Viagem iniciada sem internet (ainda na fila deste aparelho) também vale.
  const viagemIniciada = !!entrega && (entrega.temTrajetoIniciado || entregaEmViagem() === entrega.entregaId);
  // V51: retirada registrada e viagem ainda não iniciada - dá para corrigir a retirada (com motivo).
  const podeCorrigirRetirada = !!entrega && entrega.status === "ATRIBUIDA" && !!entrega.retiradaRegistrada && !entrega.temTrajetoIniciado;

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
            {precisaRetirar && (
              <Link to={`/motorista/entregas/${entrega.entregaId}/retirada`} viewTransition className="botao grande sucesso largo">
                <Icone nome="camera" /> {t.detalhe.retirarBagagem}
              </Link>
            )}
            <Link
              to={`/motorista/entregas/${entrega.entregaId}/rota`}
              viewTransition
              className={`botao grande${precisaRetirar ? " secundario" : ""}${entrega.telefone ? "" : " largo"}`}
            >
              <Icone nome="rota" /> {entrega.temTrajetoIniciado ? t.detalhe.verViagem : t.detalhe.rota}
            </Link>
            <BotaoLigar telefone={entrega.telefone} />
            {podeCorrigirRetirada && (
              <Link to={`/motorista/entregas/${entrega.entregaId}/retirada/corrigir`} viewTransition className="botao fantasma largo">
                <Icone nome="ferramenta" /> {t.detalhe.corrigirRetirada}
              </Link>
            )}
            {entrega.corrigivelAte && (
              <Link to={`/motorista/entregas/${entrega.entregaId}/corrigir`} viewTransition className="botao secundario largo">
                <Icone nome="ferramenta" /> {t.detalhe.corrigirEntrega(formatarHora(entrega.corrigivelAte))}
              </Link>
            )}
            {!encerrada && (
              <>
                {viagemIniciada ? (
                  <Link to={`/motorista/entregas/${entrega.entregaId}/comprovante`} viewTransition className="botao grande sucesso largo">
                    <Icone nome="checkCirculo" /> {t.detalhe.registrarEntrega}
                  </Link>
                ) : (
                  <p className="texto-apoio largo mb-0">{t.detalhe.iniciarAntesDeRegistrar}</p>
                )}
                <Link to={`/motorista/entregas/${entrega.entregaId}/ocorrencia`} viewTransition className="botao secundario largo">
                  <Icone nome="alerta" /> {t.detalhe.naoConsegui}
                </Link>
                <Link to={`/motorista/entregas/${entrega.entregaId}/dispensar`} viewTransition className="botao fantasma largo">
                  <Icone nome="voltar" /> {t.detalhe.dispensar}
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
            <div>
              <dt>{t.malas.rotulo}</dt>
              <dd>{t.malas.quantidade(entrega.quantidadeMalas)}</dd>
            </div>
          </dl>

          <VincularBagagemCarona
            entregaId={entrega.entregaId}
            bagagens={entrega.bagagensCarona}
            encerrada={encerrada}
            aoAlterar={carregar}
          />

          {/* V50: o papel do BDO pode se perder no caminho - só enquanto a entrega está com o motorista. */}
          {(entrega.status === "ATRIBUIDA" || entrega.status === "EM_ANDAMENTO") && (
            <SegundaViaBdo
              nomeArquivo={`BDO-${entrega.bdoNumero ?? entrega.entregaId.slice(0, 8)}.pdf`}
              baixar={() => baixarSegundaViaDaEntrega(entrega.entregaId)}
              enviar={(email) => enviarSegundaViaDaEntrega(entrega.entregaId, email)}
            />
          )}

          <HistoricoOcorrencias entregaId={entrega.entregaId} />
          <HistoricoDispensas entregaId={entrega.entregaId} />

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
