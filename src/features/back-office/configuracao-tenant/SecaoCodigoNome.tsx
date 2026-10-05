import { useState } from "react";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { criarCodigoNome, listarCodigoNome, removerCodigoNome, type CategoriaCodigoNome } from "./configuracoesTenantApi";
import { Alerta } from "../../../shared/ui/Alerta";

/** Lista com código IATA + nome, usada para bases aeroportuárias e companhias atendidas (HU11) - mesmo formato nos dois endpoints. */
export function SecaoCodigoNome({ categoria, titulo, rotuloCodigo }: { categoria: CategoriaCodigoNome; titulo: string; rotuloCodigo: string }) {
  const { dados, erro, recarregar } = useRecurso(() => listarCodigoNome(categoria), "Não foi possível carregar a lista.");
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
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
    <section aria-label={titulo}>
      <h2>{titulo}</h2>
      {(erro || erroAcao) && (
        <Alerta tipo="erro">
          {erro ?? erroAcao}
        </Alerta>
      )}
      {dados && dados.length === 0 && <p>Nenhuma cadastrada.</p>}
      <ul style={{ paddingLeft: "1.25rem" }}>
        {dados?.map((item) => (
          <li key={item.id} style={{ marginBottom: "0.25rem" }}>
            <strong>{item.codigoIata}</strong> — {item.nome}{" "}
            <button
              type="button"
              className="secundario"
              style={{ minHeight: 32, padding: "0 0.75rem" }}
              onClick={() => executar(() => removerCodigoNome(categoria, item.id), "Não foi possível remover.")}
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
      <form
        style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", maxWidth: 520 }}
        onSubmit={(evento) => {
          evento.preventDefault();
          executar(async () => {
            await criarCodigoNome(categoria, { codigoIata: codigo.trim().toUpperCase(), nome: nome.trim() });
            setCodigo("");
            setNome("");
          }, "Não foi possível cadastrar.");
        }}
      >
        <input
          aria-label={rotuloCodigo}
          placeholder={rotuloCodigo}
          value={codigo}
          maxLength={10}
          style={{ width: 110 }}
          onChange={(e) => setCodigo(e.target.value)}
        />
        <input aria-label="Nome" placeholder="Nome" value={nome} style={{ flex: 1, minWidth: 180 }} onChange={(e) => setNome(e.target.value)} />
        <button type="submit" disabled={!codigo.trim() || !nome.trim()}>
          Adicionar
        </button>
      </form>
    </section>
  );
}
