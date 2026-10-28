import { useEffect, useState } from "react";
import { mensagemDeErro } from "../../../../shared/utils/formatar";
import { useRecurso } from "../../../../shared/hooks/useRecurso";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { consultarIdentidadeVisual, salvarIdentidadeVisual } from "../../../../shared/services/identidadeVisualService";
import { PreviaIdentidadeVisual } from "../../../../shared/components/PreviaIdentidadeVisual";
import { Alerta } from "../../../../shared/components/Alerta";
import { Icone } from "../../../../shared/components/Icone";
import { Pagina, Painel } from "../../../../shared/components/Pagina";

/** Logotipo e cabeçalho dos relatórios PDF da empresa (HU13). Sem logotipo novo, o atual é mantido. */
export function IdentidadeVisualForm() {
  const textos = useTextos().backOffice;
  const t = textos.identidade;
  const salvandoTexto = textos.geral.salvando;
  const { dados, erro, recarregar } = useRecurso(consultarIdentidadeVisual, t.falhaCarregar);
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
      setErroAcao(mensagemDeErro(excecao, t.falhaSalvar));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Pagina titulo={t.titulo} descricao={t.descricao}>
      {(erro || erroAcao) && <Alerta tipo="erro">{erro ?? erroAcao}</Alerta>}
      {salvo && (
        <Alerta tipo="sucesso" aoFechar={() => setSalvo(false)}>
          {t.salva}
        </Alerta>
      )}

      <div className="grade-paineis">
        <Painel titulo={t.dadosRelatorio}>
          <form onSubmit={salvar} className="formulario">
            <div>
              <label htmlFor="cabecalho">{t.cabecalho}</label>
              <textarea
                id="cabecalho"
                rows={4}
                value={cabecalho}
                onChange={(e) => setCabecalho(e.target.value)}
                placeholder={t.cabecalhoExemplo}
              />
            </div>
            <div>
              <span
                id="rotulo-logotipo"
                style={{ display: "block", fontWeight: 600, marginBottom: "0.375rem", color: "var(--texto-titulo)" }}
              >
                {t.logotipo}
              </span>
              <label className={`seletor-foto${logotipo ? " preenchido" : ""}`} style={{ padding: "1.25rem 1rem" }}>
                <Icone nome={logotipo ? "checkCirculo" : "imagem"} />
                <strong>{logotipo ? logotipo.name : t.escolherImagem}</strong>
                <span>{t.formatoLogotipo}</span>
                <input
                  id="logotipo"
                  className="visualmente-oculto"
                  aria-labelledby="rotulo-logotipo"
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => setLogotipo(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
            <button type="submit" disabled={salvando}>
              {salvando ? salvandoTexto : t.salvar}
            </button>
          </form>
        </Painel>

        <Painel titulo={t.previa} descricao={t.previaDescricao}>
          {dados && <PreviaIdentidadeVisual identidade={{ ...dados, cabecalho }} versao={versao} arquivoLocal={logotipo} />}
        </Painel>
      </div>
    </Pagina>
  );
}
