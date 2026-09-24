import { useState } from "react";
import { formatarData, formatarMoeda } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { adicionarValor, criarPraca, historicoDaPraca, listarPracas, type PracaPedagio } from "./pedagiosApi";
import { ValorPedagioForm } from "./ValorPedagioForm";

function HistoricoValores({ praca }: { praca: PracaPedagio }) {
  const { dados, erro, carregando } = useRecurso(() => historicoDaPraca(praca.id), "Não foi possível carregar o histórico.");
  if (erro) {
    return (
      <p role="alert" style={{ color: "var(--erro)" }}>
        {erro}
      </p>
    );
  }
  if (carregando || !dados) {
    return <p role="status">Carregando histórico…</p>;
  }
  return (
    <ul style={{ margin: "0.5rem 0" }}>
      {dados.map((item) => (
        <li key={item.vigenteDesde}>
          {formatarData(item.vigenteDesde)} — {formatarMoeda(item.valor)}
        </li>
      ))}
    </ul>
  );
}

/** Praças de pedágio da empresa (HU10): cada mudança de valor vira uma nova vigência, sem apagar a anterior. */
export function TelaPedagios() {
  const { dados: pracas, erro, carregando, recarregar } = useRecurso(listarPracas, "Não foi possível carregar as praças.");
  const [aberta, setAberta] = useState<string | null>(null);
  const [novoValorEm, setNovoValorEm] = useState<string | null>(null);
  // Vira a `key` do histórico aberto para ele recarregar depois de um valor novo.
  const [versao, setVersao] = useState(0);

  return (
    <main>
      <h1>Praças de pedágio</h1>

      {erro && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {erro}
        </p>
      )}
      {carregando && <p role="status">Carregando…</p>}
      {pracas && pracas.length === 0 && <p>Nenhuma praça cadastrada.</p>}

      {pracas && pracas.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {pracas.map((praca) => (
            <li key={praca.id} style={{ border: "1px solid var(--borda)", borderRadius: 8, padding: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "0.5rem" }}>
                <div>
                  <strong>{praca.nome}</strong>
                  <div>
                    {praca.valorVigente === null
                      ? "Nenhum valor vigente hoje"
                      : `${formatarMoeda(praca.valorVigente)} desde ${formatarData(praca.vigenteDesde)}`}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button type="button" className="secundario" onClick={() => setAberta(aberta === praca.id ? null : praca.id)}>
                    {aberta === praca.id ? "Ocultar histórico" : "Histórico"}
                  </button>
                  <button type="button" className="secundario" onClick={() => setNovoValorEm(novoValorEm === praca.id ? null : praca.id)}>
                    Novo valor
                  </button>
                </div>
              </div>

              {aberta === praca.id && <HistoricoValores key={versao} praca={praca} />}

              {novoValorEm === praca.id && (
                <div style={{ marginTop: "0.75rem" }}>
                  <ValorPedagioForm
                    rotuloAcao="Registrar novo valor"
                    aoCancelar={() => setNovoValorEm(null)}
                    aoSalvar={async ({ valor, vigenteDesde }) => {
                      await adicionarValor(praca.id, { valor, vigenteDesde });
                      setNovoValorEm(null);
                      setVersao((v) => v + 1);
                      await recarregar();
                    }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <section style={{ marginTop: "2rem" }}>
        <h2>Nova praça</h2>
        <ValorPedagioForm
          pedirNome
          rotuloAcao="Cadastrar praça"
          aoSalvar={async (dados) => {
            await criarPraca(dados);
            await recarregar();
          }}
        />
      </section>
    </main>
  );
}
