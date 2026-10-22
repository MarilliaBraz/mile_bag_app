import { Icone } from "../../../shared/ui/Icone";
import { useId, useState } from "react";
import { hojeIso, mensagemDeErro } from "../../../shared/format/formatar";
import { Alerta } from "../../../shared/ui/Alerta";

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
  const [salvo, setSalvo] = useState(false);

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
    setSalvo(false);
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
      setSalvo(true);
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, "Não foi possível salvar."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="formulario">
      {erro && (
        <Alerta tipo="erro">
          {erro}
        </Alerta>
      )}
      {pedirNome && (
        <div>
          <label htmlFor={`${uid}-nomePraca`}>Nome da praça</label>
          <input id={`${uid}-nomePraca`} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Pedágio Rodovia dos Bandeirantes km 30" />
        </div>
      )}
      <div className="form-linha">
        <div>
          <label htmlFor={`${uid}-valorPedagio`}>Valor por passagem (R$)</label>
          <input id={`${uid}-valorPedagio`} inputMode="decimal" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} />
        </div>
        <div>
          <label htmlFor={`${uid}-vigenciaPedagio`}>Vigente desde</label>
          <input id={`${uid}-vigenciaPedagio`} type="date" value={vigenteDesde} onChange={(e) => setVigenteDesde(e.target.value)} />
        </div>
      </div>
      {pedirNome && (
        <fieldset style={{ border: "1px solid var(--borda-suave)", borderRadius: "var(--raio)", padding: "0.75rem 1rem 1rem", margin: 0 }}>
          <legend style={{ fontWeight: 600, padding: "0 0.25rem" }}>Localização da praça (opcional)</legend>
          <p className="texto-apoio mt-0">
            Sem a localização, a praça não é detectada nas rotas e o reembolso do pedágio fica pendente. No Google Maps, clique com o botão direito no local
            da praça e copie as coordenadas.
          </p>
          <div className="form-linha">
            <div>
              <label htmlFor={`${uid}-lat`}>Latitude</label>
              <input id={`${uid}-lat`} inputMode="decimal" placeholder="-16.6869" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
            </div>
            <div>
              <label htmlFor={`${uid}-lon`}>Longitude</label>
              <input id={`${uid}-lon`} inputMode="decimal" placeholder="-49.2648" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
            </div>
          </div>
          {localizacaoInvalida && <p className="texto-erro">Informe as duas coordenadas, dentro dos limites válidos.</p>}
        </fieldset>
      )}
      <div className="linha-acoes">
        <button type="submit" disabled={invalido || salvando}>
          {salvando ? "Salvando…" : rotuloAcao}
        </button>
        {salvo && !aoCancelar && <span role="status" style={{ color: "var(--confirmacao)", alignSelf: "center" }}>
            <Icone nome="checkCirculo" /> Valor salvo.
          </span>}
        {aoCancelar && (
          <button type="button" className="secundario" onClick={aoCancelar}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
