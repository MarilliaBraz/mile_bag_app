import { useId, useState } from "react";
import { hojeIso, mensagemDeErro } from "../../../shared/format/formatar";

type Props = {
  /** Com `nome`, cadastra uma praça nova já com o primeiro valor; sem ele, só adiciona um valor a uma praça existente. */
  pedirNome?: boolean;
  rotuloAcao: string;
  aoSalvar: (dados: { nome: string; valor: number; vigenteDesde: string; latitude?: number; longitude?: number }) => Promise<void>;
  aoCancelar?: () => void;
};

/** Formulário de valor de pedágio (HU10): valor positivo e data de vigência. */
export function ValorPedagioForm({ pedirNome = false, rotuloAcao, aoSalvar, aoCancelar }: Props) {
  const uid = useId();
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [vigenteDesde, setVigenteDesde] = useState(hojeIso());
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const numero = Number(valor.trim().replace(",", "."));
  const lat = latitude.trim() === "" ? null : Number(latitude.trim().replace(",", "."));
  const lon = longitude.trim() === "" ? null : Number(longitude.trim().replace(",", "."));
  // As duas coordenadas vêm juntas (ou nenhuma) e dentro dos limites do globo.
  const localizacaoInvalida =
    (lat === null) !== (lon === null) || (lat !== null && (Number.isNaN(lat) || lat < -90 || lat > 90)) || (lon !== null && (Number.isNaN(lon) || lon < -180 || lon > 180));
  const invalido = (pedirNome && !nome.trim()) || valor.trim() === "" || Number.isNaN(numero) || numero < 0 || !vigenteDesde || (pedirNome && localizacaoInvalida);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await aoSalvar({
        nome: nome.trim(),
        valor: numero,
        vigenteDesde,
        ...(pedirNome && lat !== null && lon !== null ? { latitude: lat, longitude: lon } : {}),
      });
      setNome("");
      setValor("");
      setLatitude("");
      setLongitude("");
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, "Não foi possível salvar."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={enviar} style={{ display: "grid", gap: "0.75rem", maxWidth: 420 }}>
      {erro && (
        <p role="alert" style={{ color: "var(--erro)", margin: 0 }}>
          {erro}
        </p>
      )}
      {pedirNome && (
        <div>
          <label htmlFor={`${uid}-nomePraca`}>Nome da praça</label>
          <input id={`${uid}-nomePraca`} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Pedágio Rodovia dos Bandeirantes km 30" />
        </div>
      )}
      <div>
        <label htmlFor={`${uid}-valorPedagio`}>Valor (R$)</label>
        <input id={`${uid}-valorPedagio`} inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} />
      </div>
      <div>
        <label htmlFor={`${uid}-vigenciaPedagio`}>Vigente desde</label>
        <input id={`${uid}-vigenciaPedagio`} type="date" value={vigenteDesde} onChange={(e) => setVigenteDesde(e.target.value)} />
      </div>
      {pedirNome && (
        <fieldset style={{ border: "1px solid var(--borda)", borderRadius: 8 }}>
          <legend>Localização da praça (opcional)</legend>
          <p style={{ fontSize: "0.85rem", marginTop: 0 }}>
            Sem a localização, a praça não é detectada nas rotas e o reembolso do pedágio fica pendente. No Google Maps, clique com o botão direito no local
            da praça e copie as coordenadas.
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <div>
              <label htmlFor={`${uid}-lat`}>Latitude</label>
              <input id={`${uid}-lat`} inputMode="decimal" placeholder="-16.6869" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
            </div>
            <div>
              <label htmlFor={`${uid}-lon`}>Longitude</label>
              <input id={`${uid}-lon`} inputMode="decimal" placeholder="-49.2648" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
            </div>
          </div>
          {localizacaoInvalida && <p style={{ color: "var(--erro)", margin: "0.5rem 0 0" }}>Informe as duas coordenadas, dentro dos limites válidos.</p>}
        </fieldset>
      )}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="submit" disabled={invalido || salvando}>
          {salvando ? "Salvando…" : rotuloAcao}
        </button>
        {aoCancelar && (
          <button type="button" className="secundario" onClick={aoCancelar}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
