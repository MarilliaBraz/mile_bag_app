import { useEffect, useState } from "react";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { consultarIdentidadeVisual, salvarIdentidadeVisual } from "./identidadeVisualApi";
import { PreviaIdentidadeVisual } from "./PreviaIdentidadeVisual";
import { Alerta } from "../../../shared/ui/Alerta";
import { Icone } from "../../../shared/ui/Icone";
import { Pagina, Painel } from "../layout/Pagina";

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
    <Pagina titulo="Identidade visual" descricao="O logotipo e o cabeçalho aparecem no topo dos relatórios em PDF do fechamento.">
      {(erro || erroAcao) && <Alerta tipo="erro">{erro ?? erroAcao}</Alerta>}
      {salvo && (
        <Alerta tipo="sucesso" aoFechar={() => setSalvo(false)}>
          Identidade visual salva.
        </Alerta>
      )}

      <div className="grade-paineis">
        <Painel titulo="Dados do relatório">
          <form onSubmit={salvar} className="formulario">
            <div>
              <label htmlFor="cabecalho">Cabeçalho</label>
              <textarea id="cabecalho" rows={4} value={cabecalho} onChange={(e) => setCabecalho(e.target.value)} placeholder="Razão social, CNPJ, endereço…" />
            </div>
            <div>
              <span id="rotulo-logotipo" style={{ display: "block", fontWeight: 600, marginBottom: "0.375rem", color: "var(--texto-titulo)" }}>
                Logotipo
              </span>
              <label className={`seletor-foto${logotipo ? " preenchido" : ""}`} style={{ padding: "1.25rem 1rem" }}>
                <Icone nome={logotipo ? "checkCirculo" : "imagem"} />
                <strong>{logotipo ? logotipo.name : "Escolher imagem"}</strong>
                <span>PNG ou JPEG. Sem arquivo novo, o logotipo atual é mantido.</span>
                <input id="logotipo" className="visualmente-oculto" aria-labelledby="rotulo-logotipo" type="file" accept="image/png,image/jpeg" onChange={(e) => setLogotipo(e.target.files?.[0] ?? null)} />
              </label>
            </div>
            <button type="submit" disabled={salvando}>
              {salvando ? "Salvando…" : "Salvar"}
            </button>
          </form>
        </Painel>

        <Painel titulo="Prévia" descricao="Como o topo do PDF vai sair.">
          {dados && <PreviaIdentidadeVisual identidade={{ ...dados, cabecalho }} versao={versao} arquivoLocal={logotipo} />}
        </Painel>
      </div>
    </Pagina>
  );
}
