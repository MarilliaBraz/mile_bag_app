import { useState } from "react";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { PlanoForm } from "./PlanoForm";
import { criarPlano, listarPlanos, removerPlano } from "./planosApi";

/** Planos de assinatura (HU16). Um plano com empresas associadas não pode ser removido - o botão nem aparece. */
export function PlanosLista() {
  const { dados, erro, carregando, recarregar } = useRecurso(listarPlanos, "Não foi possível carregar os planos.");
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState<string | null>(null);

  async function excluir(id: string) {
    setErroAcao(null);
    try {
      await removerPlano(id);
      setExcluindo(null);
      await recarregar();
    } catch (excecao) {
      setErroAcao(mensagemDeErro(excecao, "Não foi possível remover o plano."));
    }
  }

  return (
    <main>
      <h1>Planos de assinatura</h1>

      {(erro || erroAcao) && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {erro ?? erroAcao}
        </p>
      )}
      {carregando && <p role="status">Carregando…</p>}
      {dados && dados.length === 0 && <p>Nenhum plano cadastrado. Cadastre um plano antes de cadastrar empresas.</p>}

      {dados && dados.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th>Plano</th>
              <th>Motoristas ativos</th>
              <th>BDOs/mês</th>
              <th>Empresas</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {dados.map(({ plano, tenantsAssociados }) => (
              <tr key={plano.id}>
                <td>{plano.nome}</td>
                <td>{plano.limiteMotoristasAtivos}</td>
                <td>{plano.limiteVolumeMensalBdos}</td>
                <td>{tenantsAssociados}</td>
                <td>
                  {tenantsAssociados > 0 ? null : excluindo === plano.id ? (
                    <span style={{ display: "inline-flex", gap: "0.5rem" }}>
                      <button type="button" style={{ background: "var(--erro)" }} onClick={() => excluir(plano.id)}>
                        Confirmar exclusão
                      </button>
                      <button type="button" className="secundario" onClick={() => setExcluindo(null)}>
                        Cancelar
                      </button>
                    </span>
                  ) : (
                    <button type="button" className="secundario" onClick={() => setExcluindo(plano.id)}>
                      Remover
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <section style={{ marginTop: "2rem" }}>
        <h2>Novo plano</h2>
        <PlanoForm
          aoSalvar={async (dados) => {
            await criarPlano(dados);
            await recarregar();
          }}
        />
      </section>
    </main>
  );
}
