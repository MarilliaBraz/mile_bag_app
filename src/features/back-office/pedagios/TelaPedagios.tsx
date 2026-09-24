import { useId, useState } from "react";
import { formatarData, formatarMoeda, mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { adicionarValor, criarPraca, definirLocalizacaoDaPraca, historicoDaPraca, listarPracas, type PracaPedagio } from "./pedagiosApi";
import { ValorPedagioForm } from "./ValorPedagioForm";

function LocalizacaoForm({ praca, aoConcluir }: { praca: PracaPedagio; aoConcluir: () => Promise<void> }) {
  const uid = useId();
  const [latitude, setLatitude] = useState(praca.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(praca.longitude?.toString() ?? "");
  const [erro, setErro] = useState<string | null>(null);

  const lat = Number(latitude.trim().replace(",", "."));
  const lon = Number(longitude.trim().replace(",", "."));
  const valida = latitude.trim() !== "" && longitude.trim() !== "" && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;

  async function salvar(latitudeNova: number | null, longitudeNova: number | null) {
    setErro(null);
    try {
      await definirLocalizacaoDaPraca(praca.id, latitudeNova, longitudeNova);
      await aoConcluir();
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, "Não foi possível salvar a localização."));
    }
  }

  return (
    <form
      onSubmit={(evento) => {
        evento.preventDefault();
        void salvar(lat, lon);
      }}
      style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "end", marginTop: "0.75rem" }}
    >
      <div>
        <label htmlFor={`${uid}-lat`}>Latitude</label>
        <input id={`${uid}-lat`} inputMode="decimal" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
      </div>
      <div>
        <label htmlFor={`${uid}-lon`}>Longitude</label>
        <input id={`${uid}-lon`} inputMode="decimal" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
      </div>
      <button type="submit" disabled={!valida}>
        Salvar localização
      </button>
      {praca.latitude !== null && (
        <button type="button" className="secundario" onClick={() => void salvar(null, null)}>
          Remover localização
        </button>
      )}
      {erro && (
        <span role="alert" style={{ color: "var(--erro)" }}>
          {erro}
        </span>
      )}
    </form>
  );
}

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
  const [localizandoEm, setLocalizandoEm] = useState<string | null>(null);
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
                  <button type="button" className="secundario" onClick={() => setLocalizandoEm(localizandoEm === praca.id ? null : praca.id)}>
                    Localização
                  </button>
                  <button type="button" className="secundario" onClick={() => setNovoValorEm(novoValorEm === praca.id ? null : praca.id)}>
                    Novo valor
                  </button>
                </div>
              </div>

              <div style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                {praca.latitude === null || praca.longitude === null
                  ? "Sem localização: não é detectada nas rotas (o reembolso deste pedágio fica pendente)."
                  : `Localização: ${praca.latitude}, ${praca.longitude}`}
              </div>
              {localizandoEm === praca.id && (
                <LocalizacaoForm
                  praca={praca}
                  aoConcluir={async () => {
                    setLocalizandoEm(null);
                    await recarregar();
                  }}
                />
              )}

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
