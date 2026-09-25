import { Ajuda } from "../../../shared/ui/Ajuda";
import { useEffect, useState } from "react";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { consultarIdentidadeVisual, salvarIdentidadeVisual } from "./identidadeVisualApi";
import { PreviaIdentidadeVisual } from "./PreviaIdentidadeVisual";

/** Logotipo e cabeçalho dos relatórios PDF da empresa (HU13). Sem logotipo novo, o atual é mantido. */
export function IdentidadeVisualForm() {
  const { dados, erro, recarregar } = useRecurso(consultarIdentidadeVisual, "Não foi possível carregar a identidade visual.");
  const [cabecalho, setCabecalho] = useState("");
  const [logotipo, setLogotipo] = useState<File | null>(null);
  const [versao, setVersao] = useState(0);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (dados) {
      setCabecalho(dados.cabecalho ?? "");
    }
  }, [dados]);

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    setErroAcao(null);
    setSalvo(false);
    setSalvando(true);
    try {
      await salvarIdentidadeVisual({ logotipo, cabecalho });
      setLogotipo(null);
      setVersao((v) => v + 1);
      setSalvo(true);
      await recarregar();
    } catch (excecao) {
      setErroAcao(mensagemDeErro(excecao, "Não foi possível salvar a identidade visual."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main>
      <h1>Identidade visual</h1>
      <Ajuda>
        <p>Envie o logotipo (PNG ou JPEG) e o texto do cabeçalho. Eles aparecem nos relatórios em PDF da sua empresa. A prévia mostra como o relatório vai ficar.</p>
      </Ajuda>
      <p>O logotipo e o cabeçalho aparecem no topo dos relatórios em PDF do fechamento.</p>

      {(erro || erroAcao) && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {erro ?? erroAcao}
        </p>
      )}

      <form onSubmit={salvar} style={{ display: "grid", gap: "0.75rem", maxWidth: 480 }}>
        <div>
          <label htmlFor="cabecalho">Cabeçalho</label>
          <textarea id="cabecalho" rows={3} value={cabecalho} onChange={(e) => setCabecalho(e.target.value)} placeholder="Razão social, CNPJ, endereço…" />
        </div>
        <div>
          <label htmlFor="logotipo">Logotipo (PNG ou JPEG)</label>
          <input id="logotipo" type="file" accept="image/png,image/jpeg" onChange={(e) => setLogotipo(e.target.files?.[0] ?? null)} />
        </div>
        <div>
          <button type="submit" disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar"}
          </button>
          {salvo && (
            <span role="status" style={{ marginLeft: "0.75rem", color: "var(--confirmacao)" }}>
              Salvo.
            </span>
          )}
        </div>
      </form>

      <h2>Prévia</h2>
      {dados && <PreviaIdentidadeVisual identidade={{ ...dados, cabecalho }} versao={versao} arquivoLocal={logotipo} />}
    </main>
  );
}
