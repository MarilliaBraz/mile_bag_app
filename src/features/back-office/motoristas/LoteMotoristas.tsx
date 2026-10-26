import { useId, useState } from "react";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useTextos } from "../../../shared/i18n/idioma";
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
  const t = useTextos().backOffice.motoristas;

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
      setErro(mensagemDeErro(excecao, t.falhaLote));
    } finally {
      setEnviando(false);
    }
  }

  const comSenhaGerada = resultados?.some((r) => r.criado && r.senhaGerada) ?? false;

  return (
    <div>
      <form onSubmit={enviar} className="formulario">
        {erro && <Alerta tipo="erro">{erro}</Alerta>}
        <div>
          <label htmlFor={`${uid}-lote`}>{t.loteRotulo}</label>
          <textarea
            className="mono"
            id={`${uid}-lote`}
            rows={6}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={"Maria Souza;maria@empresa.com\nJoão Lima;joao.lima;senha-inicial-123"}
            aria-describedby={`${uid}-lote-ajuda`}
          />
          <span id={`${uid}-lote-ajuda`} className="texto-apoio">
            {t.loteAjuda(MAXIMO_POR_LOTE)}
          </span>
        </div>
        {excedeu && <Alerta tipo="erro">{t.loteMaximo(MAXIMO_POR_LOTE)}</Alerta>}
        <button type="submit" className="bloco" disabled={linhas.length === 0 || excedeu || enviando}>
          {enviando ? t.cadastrando : t.cadastrarQuantos(linhas.length)}
        </button>
      </form>

      {resultados && (
        <section className="mt-4" aria-label={t.resultadoLote}>
          <h3>{t.resultado(resultados.filter((r) => r.criado).length, resultados.filter((r) => !r.criado).length)}</h3>
          {comSenhaGerada && (
            <Alerta tipo="aviso">
              {t.senhasSoAgora}{" "}
              <button type="button" className="secundario compacto" onClick={() => baixarSenhas(resultados)}>
                <Icone nome="baixar" /> {t.baixarCsv}
              </button>
            </Alerta>
          )}
          <div className="tabela-rolavel">
            <table className="tabela">
              <thead>
                <tr>
                  <th scope="col">{t.colunaLinha}</th>
                  <th scope="col">{t.colunaNome}</th>
                  <th scope="col">{t.colunaLogin}</th>
                  <th scope="col">{t.colunaSituacao}</th>
                  <th scope="col">{t.colunaSenhaGerada}</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((r) => (
                  <tr key={r.linha}>
                    <td>{r.linha}</td>
                    <td>{r.nome}</td>
                    <td>{r.login}</td>
                    <td>
                      {r.criado ? (
                        <span className="selo selo-sucesso">{t.criado}</span>
                      ) : (
                        <span className="selo selo-erro">{r.mensagem ?? t.erro}</span>
                      )}
                    </td>
                    <td className="mono">{r.senhaGerada ?? ""}</td>
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
