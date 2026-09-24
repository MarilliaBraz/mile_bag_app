import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../../../shared/api/ApiError";
import { VincularBagagemCarona } from "../../captura-bdo/bagagem-carona/VincularBagagemCarona";
import { BotaoLigar } from "../../mensageria/components/BotaoLigar";
import { consultarDetalhe } from "../services/painelService";
import type { ItemPainelDetalhe } from "../types";

/**
 * Detalhe completo de uma entrega (HU19, FR-003) - passageiro, endereço,
 * dados do BDO e bagagens carona vinculadas (HU05), com acesso à rota e
 * viagem (HU03/HU04) e à ligação direta ao passageiro (HU21). Ainda não
 * integra comprovante (HU06), ocorrência (HU07), mensageria (HU18) e
 * marcos de progresso (HU20): essas telas não existem neste front-end ainda.
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

  return (
    <main style={{ maxWidth: 560, margin: "2rem auto", padding: "0 1rem" }}>
      <Link to="/motorista">← Voltar para o painel</Link>

      {erro && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {erro}
        </p>
      )}

      {!entrega && !erro && <p role="status">Carregando…</p>}

      {entrega && (
        <>
          <h1>{entrega.bdoNumero ?? "BDO sem número"}</h1>

          <dl>
            <dt>Passageiro</dt>
            <dd>{entrega.passageiroNome ?? "Não identificado"}</dd>

            <dt>Endereço de entrega</dt>
            <dd>{entrega.endereco ?? "Não informado"}</dd>

            <dt>Companhia aérea</dt>
            <dd>{entrega.companhiaAerea ?? "Não informada"}</dd>

            <dt>Etiqueta da bagagem</dt>
            <dd>{entrega.etiquetaBagagem ?? "Não informada"}</dd>

            <dt>Telefone do passageiro</dt>
            <dd>{entrega.telefone ?? "Não informado"}</dd>
          </dl>

          <VincularBagagemCarona
            entregaId={entrega.entregaId}
            bagagens={entrega.bagagensCarona}
            encerrada={entrega.status === "ENCERRADA_COM_SUCESSO"}
            aoAlterar={carregar}
          />

          <section style={{ marginTop: "1.5rem" }}>
            <h2>Rota e viagem</h2>
            <Link to={`/motorista/entregas/${entrega.entregaId}/rota`}>
              {entrega.temTrajetoIniciado ? "Acompanhar viagem em andamento →" : "Calcular rota e iniciar viagem →"}
            </Link>
          </section>

          {/* HU06/HU07: os dois desfechos possíveis da entrega - ambos somem
              quando ela já foi encerrada com comprovante. */}
          {entrega.status !== "ENCERRADA_COM_SUCESSO" && (
            <section style={{ marginTop: "1.5rem" }}>
              <h2>Encerrar entrega</h2>
              <p>
                <Link to={`/motorista/entregas/${entrega.entregaId}/comprovante`}>Registrar comprovante de entrega →</Link>
              </p>
              <p>
                <Link to={`/motorista/entregas/${entrega.entregaId}/ocorrencia`}>Registrar ocorrência de não entrega →</Link>
              </p>
            </section>
          )}

          {/* HU21 (FR-004/RI15): mesmo espaço reservado à conversa da entrega
              (HU18), que ainda não existe neste front-end. */}
          <section style={{ marginTop: "1.5rem" }}>
            <h2>Contato com o passageiro</h2>
            <BotaoLigar telefone={entrega.telefone} />
          </section>
        </>
      )}
    </main>
  );
}
