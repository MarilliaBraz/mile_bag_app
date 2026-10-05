import { useId, useState } from "react";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { criarMotoristasEmLote, type LinhaLote, type ResultadoLote } from "./motoristasApi";
import { Alerta } from "../../../shared/ui/Alerta";
import { Icone } from "../../../shared/ui/Icone";

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
      <form onSubmit={enviar} className="formulario">
        {erro && (
          <Alerta tipo="erro">
            {erro}
          </Alerta>
        )}
        <div>
          <label htmlFor={`${uid}-lote`}>Um motorista por linha: nome;login;senha</label>
          <textarea
            id={`${uid}-lote`}
            rows={6}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={"Maria Souza;maria@empresa.com\nJoão Lima;joao.lima;senha-inicial-123"}
            style={{ fontFamily: "ui-monospace, Consolas, monospace" }}
            aria-describedby={`${uid}-lote-ajuda`}
          />
          <span id={`${uid}-lote-ajuda`} className="texto-apoio">
            A senha é opcional: sem ela o sistema gera uma de 12 caracteres. Até {MAXIMO_POR_LOTE} por vez. Pode colar direto de uma planilha.
          </span>
        </div>
        {excedeu && <Alerta tipo="erro">Máximo de {MAXIMO_POR_LOTE} motoristas por vez.</Alerta>}
        <button type="submit" className="bloco" disabled={linhas.length === 0 || excedeu || enviando}>
          {enviando ? "Cadastrando…" : `Cadastrar ${linhas.length} motorista(s)`}
        </button>
      </form>

      {resultados && (
        <section aria-label="Resultado do lote" style={{ marginTop: "1rem" }}>
          <h3>
            Resultado: {resultados.filter((r) => r.criado).length} criado(s), {resultados.filter((r) => !r.criado).length} com erro
          </h3>
          {comSenhaGerada && (
            <Alerta tipo="aviso">
              As senhas geradas aparecem só agora e não ficam guardadas em claro: entregue-as aos motoristas ou baixe o CSV.{" "}
              <button type="button" className="secundario compacto" onClick={() => baixarSenhas(resultados)}>
                <Icone nome="baixar" /> Baixar CSV com as senhas
              </button>
            </Alerta>
          )}
          <div className="tabela-rolavel">
<table className="tabela">
            <thead>
              <tr>
                <th scope="col">Linha</th>
                <th scope="col">Nome</th>
                <th scope="col">Login</th>
                <th scope="col">Situação</th>
                <th scope="col">Senha gerada</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((r) => (
                <tr key={r.linha}>
                  <td>{r.linha}</td>
                  <td>{r.nome}</td>
                  <td>{r.login}</td>
                  <td>{r.criado ? <span className="selo selo-sucesso">Criado</span> : <span className="selo selo-erro">{r.mensagem ?? "Erro"}</span>}</td>
                  <td style={{ fontFamily: "ui-monospace, Consolas, monospace" }}>{r.senhaGerada ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        </section>
      )}
    </div>
  );
}
