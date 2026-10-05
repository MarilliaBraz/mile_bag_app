import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../../../shared/api/ApiError";
import { Alerta, Carregando } from "../../../../shared/ui/Alerta";
import { Icone } from "../../../../shared/ui/Icone";
import { VincularBagagemCarona } from "../../captura-bdo/bagagem-carona/VincularBagagemCarona";
import { TelaMotorista } from "../../layout/TelaMotorista";
import { BotaoLigar } from "../../mensageria/components/BotaoLigar";
import { Conversa } from "../../mensageria/components/Conversa";
import { HistoricoOcorrencias } from "../../ocorrencia/HistoricoOcorrencias";
import { consultarDetalhe } from "../services/painelService";
import type { ItemPainelDetalhe } from "../types";
import { STATUS_ENTREGA } from "./statusEntrega";

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

  const carregar = useCallback(() => {
    if (!entregaId) {
      return;
    }
    setErro(null);
    consultarDetalhe(entregaId)
      .then(setEntrega)
      .catch((excecao) => {
        setErro(excecao instanceof ApiError ? excecao.message : "Não foi possível carregar esta entrega.");
      });
  }, [entregaId]);

  useEffect(() => {
    setEntrega(null);
    carregar();
  }, [carregar]);

  const encerrada = entrega?.status === "ENCERRADA_COM_SUCESSO";
  const status = entrega ? STATUS_ENTREGA[entrega.status] : null;

  return (
    <TelaMotorista titulo={entrega?.bdoNumero ?? "Entrega"} voltarPara="/motorista" rotuloVoltar="Voltar para o painel">
      {erro && (
        <Alerta tipo="erro">
          <p>{erro}</p>
          <button type="button" className="secundario" onClick={carregar}>
            <Icone nome="sincronizar" /> Tentar de novo
          </button>
        </Alerta>
      )}

      {!entrega && !erro && <Carregando texto="Carregando entrega…" />}

      {entrega && status && (
        <>
          <section className="cartao" aria-label="Destino">
            <div className="cartao-cabecalho">
              <span className="texto-apoio">Entregar para</span>
              <span className={`selo selo-${status.tom}`}>{status.texto}</span>
            </div>
            <div className="destaque" style={{ fontSize: "1.375rem" }}>
              {entrega.passageiroNome ?? "Passageiro não identificado"}
            </div>
            <div className="linha-icone" style={{ marginTop: "0.5rem", fontSize: "1.0625rem" }}>
              <Icone nome="pino" />
              <span>{entrega.endereco ?? "Endereço não informado"}</span>
            </div>
          </section>

          <div className="grade-acoes" style={{ marginTop: "1rem" }}>
            <Link to={`/motorista/entregas/${entrega.entregaId}/rota`} className={`botao grande${entrega.telefone ? "" : " largo"}`}>
              <Icone nome="rota" /> {entrega.temTrajetoIniciado ? "Ver viagem" : "Rota"}
            </Link>
            <BotaoLigar telefone={entrega.telefone} />
            {!encerrada && (
              <>
                <Link to={`/motorista/entregas/${entrega.entregaId}/comprovante`} className="botao grande sucesso largo">
                  <Icone nome="checkCirculo" /> Registrar entrega
                </Link>
                <Link to={`/motorista/entregas/${entrega.entregaId}/ocorrencia`} className="botao secundario largo">
                  <Icone nome="alerta" /> Não consegui entregar
                </Link>
              </>
            )}
          </div>

          <h2>Dados do BDO</h2>
          <dl className="cartao dados-grade">
            <div>
              <dt>Companhia aérea</dt>
              <dd>{entrega.companhiaAerea ?? "Não informada"}</dd>
            </div>
            <div>
              <dt>Etiqueta da bagagem</dt>
              <dd className="codigo">{entrega.etiquetaBagagem ?? "Não informada"}</dd>
            </div>
            <div>
              <dt>Telefone</dt>
              <dd>{entrega.telefone ?? "Não informado"}</dd>
            </div>
            <div>
              <dt>Número do BDO</dt>
              <dd className="codigo">{entrega.bdoNumero ?? "Sem número"}</dd>
            </div>
          </dl>

          <VincularBagagemCarona entregaId={entrega.entregaId} bagagens={entrega.bagagensCarona} encerrada={encerrada} aoAlterar={carregar} />

          <HistoricoOcorrencias entregaId={entrega.entregaId} />

          {/* HU18: conversa com o passageiro (a ligação, HU21, fica nas ações do topo). */}
          <section>
            <h2>
              <Icone nome="conversa" /> Conversa com o passageiro
            </h2>
            <Conversa entregaId={entrega.entregaId} />
          </section>
        </>
      )}
    </TelaMotorista>
  );
}
