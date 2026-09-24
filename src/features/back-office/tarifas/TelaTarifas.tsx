import { useState } from "react";
import { formatarData, formatarMoeda, mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { listarMotoristas, nomeDoMotorista, type Motorista } from "../motoristas/motoristasApi";
import { TarifaForm } from "./TarifaForm";
import { atualizarTarifa, criarTarifa, listarTarifas, removerTarifa, type EscopoTarifa, type Tarifa } from "./tarifasApi";

const ROTULO_ESCOPO: Record<EscopoTarifa, string> = { PADRAO: "Padrão", MOTORISTA: "Motorista", REGIAO: "Região" };

function alvoDe(tarifa: Tarifa, motoristas: Motorista[] | null): string {
  if (tarifa.escopo === "MOTORISTA") {
    return nomeDoMotorista(motoristas, tarifa.motoristaId);
  }
  return tarifa.escopo === "REGIAO" ? (tarifa.regiao ?? "—") : "Todos";
}

/** Tabelas de tarifa da empresa (HU09): a mais específica vale (motorista > região > padrão, FR-004). */
export function TelaTarifas() {
  const { dados: tarifas, erro, carregando, recarregar } = useRecurso(listarTarifas, "Não foi possível carregar as tarifas.");
  const { dados: motoristas } = useRecurso(listarMotoristas, "Não foi possível carregar os motoristas.");
  const [editando, setEditando] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  async function excluir(id: string) {
    setErroAcao(null);
    try {
      await removerTarifa(id);
      setExcluindo(null);
      await recarregar();
    } catch (excecao) {
      setErroAcao(mensagemDeErro(excecao, "Não foi possível excluir a tarifa."));
    }
  }

  return (
    <main>
      <h1>Tarifas</h1>

      {erro && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {erro}
        </p>
      )}
      {erroAcao && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {erroAcao}
        </p>
      )}
      {carregando && <p role="status">Carregando…</p>}

      {tarifas && tarifas.length === 0 && <p>Nenhuma tarifa cadastrada. Sem tarifa padrão, o fechamento marca as entregas como pendentes.</p>}

      {tarifas && tarifas.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th>Escopo</th>
              <th>Alvo</th>
              <th>Valor fixo</th>
              <th>Por km</th>
              <th>Vigente desde</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {tarifas.map((tarifa) => (
              <tr key={tarifa.id} style={{ verticalAlign: "top" }}>
                <td>{ROTULO_ESCOPO[tarifa.escopo]}</td>
                <td style={{ wordBreak: "break-all" }}>{alvoDe(tarifa, motoristas)}</td>
                <td>{formatarMoeda(tarifa.valorFixo)}</td>
                <td>{formatarMoeda(tarifa.valorPorKm)}</td>
                <td>{formatarData(tarifa.vigenteDesde)}</td>
                <td>
                  {editando === tarifa.id ? null : excluindo === tarifa.id ? (
                    <span style={{ display: "inline-flex", gap: "0.5rem" }}>
                      <button type="button" style={{ background: "var(--erro)" }} onClick={() => excluir(tarifa.id)}>
                        Confirmar exclusão
                      </button>
                      <button type="button" className="secundario" onClick={() => setExcluindo(null)}>
                        Cancelar
                      </button>
                    </span>
                  ) : (
                    <span style={{ display: "inline-flex", gap: "0.5rem" }}>
                      <button type="button" className="secundario" onClick={() => setEditando(tarifa.id)}>
                        Editar
                      </button>
                      <button type="button" className="secundario" onClick={() => setExcluindo(tarifa.id)}>
                        Excluir
                      </button>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tarifas
        ?.filter((tarifa) => tarifa.id === editando)
        .map((tarifa) => (
          <section key={tarifa.id} style={{ marginTop: "1rem" }}>
            <h2>Editar tarifa ({ROTULO_ESCOPO[tarifa.escopo]})</h2>
            <p style={{ fontSize: "0.85rem" }}>Só valores e vigência mudam; viagens já encerradas e fechamentos emitidos não são recalculados.</p>
            <TarifaForm
              tarifa={tarifa}
              aoCancelar={() => setEditando(null)}
              aoSalvar={async (dados) => {
                await atualizarTarifa(tarifa.id, {
                  valorFixo: dados.valorFixo,
                  valorPorKm: dados.valorPorKm,
                  vigenteDesde: dados.vigenteDesde,
                });
                setEditando(null);
                await recarregar();
              }}
            />
          </section>
        ))}

      <section style={{ marginTop: "2rem" }}>
        <h2>Nova tarifa</h2>
        <TarifaForm
          key={tarifas?.length ?? 0}
          aoSalvar={async (dados) => {
            await criarTarifa(dados);
            await recarregar();
          }}
        />
      </section>
    </main>
  );
}
