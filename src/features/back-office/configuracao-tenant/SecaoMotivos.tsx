import { useState } from "react";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { criarMotivo, desativarMotivo, listarMotivos } from "./configuracoesTenantApi";

/**
 * Motivos de não entrega (HU11, FR-009): nunca se apaga, só se desativa - as
 * ocorrências antigas continuam apontando para o motivo. A API só lista os
 * ativos, então um motivo desativado some daqui e não há como reativá-lo.
 */
export function SecaoMotivos() {
  const { dados, erro, recarregar } = useRecurso(listarMotivos, "Não foi possível carregar os motivos.");
  const [descricao, setDescricao] = useState("");
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  async function executar(acao: () => Promise<unknown>, mensagem: string) {
    setErroAcao(null);
    try {
      await acao();
      await recarregar();
    } catch (excecao) {
      setErroAcao(mensagemDeErro(excecao, mensagem));
    }
  }

  return (
    <section aria-labelledby="titulo-motivos">
      <h2 id="titulo-motivos">Motivos de não entrega</h2>
      {(erro || erroAcao) && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {erro ?? erroAcao}
        </p>
      )}
      {dados && dados.length === 0 && <p>Nenhum motivo ativo.</p>}
      <ul style={{ paddingLeft: "1.25rem" }}>
        {dados?.map((motivo) => (
          <li key={motivo.id} style={{ marginBottom: "0.25rem" }}>
            {motivo.descricao}{" "}
            <button
              type="button"
              className="secundario"
              style={{ minHeight: 32, padding: "0 0.75rem" }}
              onClick={() => executar(() => desativarMotivo(motivo.id), "Não foi possível desativar o motivo.")}
            >
              Desativar
            </button>
          </li>
        ))}
      </ul>
      <form
        style={{ display: "flex", gap: "0.5rem", maxWidth: 480 }}
        onSubmit={(evento) => {
          evento.preventDefault();
          executar(async () => {
            await criarMotivo(descricao.trim());
            setDescricao("");
          }, "Não foi possível criar o motivo.");
        }}
      >
        <input aria-label="Novo motivo" placeholder="Novo motivo" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        <button type="submit" disabled={!descricao.trim()}>
          Adicionar
        </button>
      </form>
    </section>
  );
}
