import { useId, useState } from "react";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { criarMotoristasEmLote, type LinhaLote, type ResultadoLote } from "./motoristasApi";

const MAXIMO_POR_LOTE = 100;

/**
 * Interpreta o texto colado: uma linha por motorista, `nome;login;senha` (a senha é opcional). Aceita `;`, tabulação
 * (planilha) ou `,` como separador. Uma primeira linha de cabeçalho ("nome;login") é ignorada.
 */
export function interpretarLinhas(texto: string): LinhaLote[] {
  const linhas = texto
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter((linha) => linha !== "");
  const resultado: LinhaLote[] = [];
  linhas.forEach((linha, indice) => {
    const separador = linha.includes(";") ? ";" : linha.includes("\t") ? "\t" : ",";
    const [nome = "", login = "", senha = ""] = linha.split(separador).map((parte) => parte.trim());
    if (indice === 0 && nome.toLowerCase() === "nome" && login.toLowerCase() === "login") {
      return;
    }
    resultado.push({ nome, login, senha });
  });
  return resultado;
}

function baixarSenhas(resultados: ResultadoLote[]) {
  const geradas = resultados.filter((r) => r.criado && r.senhaGerada);
  const csv = ["nome;login;senha", ...geradas.map((r) => `${r.nome};${r.login};${r.senhaGerada}`)].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "motoristas-senhas-iniciais.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Cadastro de vários motoristas de uma vez (HU27). Cada linha é independente: as que falham aparecem com o motivo e as
 * outras são criadas. Senhas geradas pelo sistema aparecem SÓ nesta tela (e no CSV baixado) - não há como consultá-las depois.
 */
export function LoteMotoristas({ aoConcluir }: { aoConcluir: () => Promise<void> }) {
  const uid = useId();
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState<ResultadoLote[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const linhas = interpretarLinhas(texto);
  const excedeu = linhas.length > MAXIMO_POR_LOTE;

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const resposta = await criarMotoristasEmLote(linhas);
      setResultados(resposta.resultados);
      if (resposta.criados > 0) {
        await aoConcluir();
      }
      if (resposta.comErro === 0) {
        setTexto("");
      }
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, "Não foi possível cadastrar o lote."));
    } finally {
      setEnviando(false);
    }
  }

  const comSenhaGerada = resultados?.some((r) => r.criado && r.senhaGerada) ?? false;

  return (
    <div>
      <form onSubmit={enviar} style={{ display: "grid", gap: "0.75rem", maxWidth: 640 }}>
        {erro && (
          <p role="alert" style={{ color: "var(--erro)", margin: 0 }}>
            {erro}
          </p>
        )}
        <div>
          <label htmlFor={`${uid}-lote`}>Um motorista por linha: nome;login;senha</label>
          <textarea
            id={`${uid}-lote`}
            rows={6}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={"Maria Souza;maria@empresa.com\nJoão Lima;joao.lima;senha-inicial-123"}
            style={{ fontFamily: "monospace" }}
          />
          <span style={{ fontSize: "0.85rem" }}>
            A senha é opcional: sem ela o sistema gera uma de 12 caracteres. Até {MAXIMO_POR_LOTE} por vez. Pode colar direto de uma planilha.
          </span>
        </div>
        <div>
          <button type="submit" disabled={linhas.length === 0 || excedeu || enviando}>
            {enviando ? "Cadastrando…" : `Cadastrar ${linhas.length} motorista(s)`}
          </button>
          {excedeu && <span style={{ color: "var(--erro)", marginLeft: "0.75rem" }}>Máximo de {MAXIMO_POR_LOTE} por vez.</span>}
        </div>
      </form>

      {resultados && (
        <section aria-label="Resultado do lote" style={{ marginTop: "1rem" }}>
          <h3>
            Resultado: {resultados.filter((r) => r.criado).length} criado(s), {resultados.filter((r) => !r.criado).length} com erro
          </h3>
          {comSenhaGerada && (
            <p role="status" style={{ padding: "0.5rem 0.75rem", border: "1px solid var(--aviso)", borderRadius: 8, color: "var(--aviso)" }}>
              As senhas geradas aparecem só agora e não ficam guardadas em claro: entregue-as aos motoristas ou baixe o CSV.{" "}
              <button type="button" className="secundario" onClick={() => baixarSenhas(resultados)}>
                Baixar CSV com as senhas
              </button>
            </p>
          )}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th>Linha</th>
                <th>Nome</th>
                <th>Login</th>
                <th>Situação</th>
                <th>Senha gerada</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((r) => (
                <tr key={r.linha} style={r.criado ? undefined : { color: "var(--erro)" }}>
                  <td>{r.linha}</td>
                  <td>{r.nome}</td>
                  <td>{r.login}</td>
                  <td>{r.criado ? "Criado" : r.mensagem}</td>
                  <td style={{ fontFamily: "monospace" }}>{r.senhaGerada ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
