import { Ajuda } from "../../../shared/ui/Ajuda";
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
      <Ajuda>
        <p>Um plano define o limite de motoristas ativos e de BDOs por mês. Cadastre um plano antes de cadastrar empresas. Para mudar o plano de uma empresa, abra a empresa em “Empresas”.</p>
      </Ajuda>

      {(erro || erroAcao) && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {erro ?? erroAcao}
        </p>
      )}
      {carregando && <p role="status">Carregando…</p>}
      {dados && dados.length === 0 && <p>Nenhum plano cadastrado. Cadastre um plano antes de cadastrar empresas.</p>}

      {dados && dados.length > 0 && (
        <div className="tabela-rolavel">
<table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th scope="col">Plano</th>
              <th scope="col">Motoristas ativos</th>
              <th scope="col">BDOs/mês</th>
              <th scope="col">Empresas</th>
              <th scope="col" />
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
</div>
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
