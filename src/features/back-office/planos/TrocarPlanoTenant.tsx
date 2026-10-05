import { useState } from "react";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { ConfirmarAcao } from "../../../shared/ui/ConfirmarAcao";
import { listarPlanos, trocarPlanoDoTenant, type ResultadoTrocaPlano } from "./planosApi";
import { Alerta } from "../../../shared/ui/Alerta";

/**
 * Troca de plano de uma empresa (HU16, FR-006). A troca sempre acontece; se o
 * uso atual da empresa já passa dos limites do novo plano, a resposta traz
 * `usoExcedeuLimiteNaTroca` e a tela avisa - é um alerta, não um bloqueio.
 */
export function TrocarPlanoTenant({ tenantId, planoAtualId, aoTrocar }: { tenantId: string; planoAtualId: string; aoTrocar?: () => void }) {
  const { dados: planos, erro } = useRecurso(listarPlanos, "Não foi possível carregar os planos.");
  const [escolhido, setEscolhido] = useState("");
  const [resultado, setResultado] = useState<ResultadoTrocaPlano | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [trocando, setTrocando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  async function trocar() {
    setErroAcao(null);
    setResultado(null);
    setTrocando(true);
    try {
      setResultado(await trocarPlanoDoTenant(tenantId, escolhido));
      aoTrocar?.();
    } catch (excecao) {
      setErroAcao(mensagemDeErro(excecao, "Não foi possível trocar o plano."));
    } finally {
      setTrocando(false);
      setConfirmando(false);
    }
  }

  return (
    <form onSubmit={(evento) => { evento.preventDefault(); setConfirmando(true); }} style={{ display: "grid", gap: "0.75rem", maxWidth: 420 }}>
      {(erro || erroAcao) && (
        <Alerta tipo="erro">
          {erro ?? erroAcao}
        </Alerta>
      )}
      <div>
        <label htmlFor="novoPlano">Novo plano</label>
        <select id="novoPlano" value={escolhido} onChange={(e) => setEscolhido(e.target.value)}>
          <option value="">Escolha um plano</option>
          {planos
            ?.filter(({ plano }) => plano.id !== planoAtualId)
            .map(({ plano }) => (
              <option key={plano.id} value={plano.id}>
                {plano.nome} ({plano.limiteMotoristasAtivos} motoristas, {plano.limiteVolumeMensalBdos} BDOs/mês)
              </option>
            ))}
        </select>
      </div>
      <div>
        <button type="submit" disabled={!escolhido || trocando}>
          {trocando ? "Trocando…" : "Trocar plano"}
        </button>
      </div>
      <ConfirmarAcao
        aberto={confirmando}
        titulo="Trocar o plano da empresa?"
        descricao="A troca vale imediatamente. Se o uso atual da empresa já passa dos limites do novo plano, você será avisado, mas a troca acontece mesmo assim."
        rotuloConfirmar="Trocar plano"
        ocupado={trocando}
        aoConfirmar={trocar}
        aoCancelar={() => setConfirmando(false)}
      />
      {resultado && (
        <p role="status" style={{ margin: 0, color: resultado.usoExcedeuLimiteNaTroca ? "var(--aviso)" : "var(--confirmacao)" }}>
          Plano alterado para {resultado.planoVigente.nome}.
          {resultado.usoExcedeuLimiteNaTroca && " Atenção: o uso atual da empresa já ultrapassa os limites do novo plano."}
        </p>
      )}
    </form>
  );
}
