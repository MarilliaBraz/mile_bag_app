import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../../../shared/api/ApiError";
import { consultarDetalhe } from "../services/painelService";
import type { ItemPainelDetalhe } from "../types";

/**
 * Detalhe completo de uma entrega (HU19, FR-003) - passageiro, endereço,
 * dados do BDO e bagagens carona vinculadas. Ainda não integra os demais
 * fluxos por entrega (rota/viagem — HU03/HU04, comprovante — HU06,
 * ocorrência — HU07, ligação — HU21, mensageria — HU18): essas telas não
 * existem neste front-end ainda.
 */
export function DetalheEntrega() {
  const { entregaId } = useParams<{ entregaId: string }>();
  const [entrega, setEntrega] = useState<ItemPainelDetalhe | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!entregaId) {
      return;
    }
    setErro(null);
    setEntrega(null);
    consultarDetalhe(entregaId)
      .then(setEntrega)
      .catch((excecao) => {
        setErro(excecao instanceof ApiError ? excecao.message : "Não foi possível carregar esta entrega.");
      });
  }, [entregaId]);

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

          {entrega.bagagensCarona.length > 0 && (
            <section>
              <h2>Bagagens carona</h2>
              <ul>
                {entrega.bagagensCarona.map((bagagem) => (
                  <li key={bagagem.id}>{bagagem.etiquetaBagagem ?? "Sem etiqueta"}</li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </main>
  );
}
