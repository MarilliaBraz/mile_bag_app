import { useId, useState } from "react";
import { hojeIso, mensagemDeErro } from "../../../shared/format/formatar";

type Props = {
  /** Com `nome`, cadastra uma praça nova já com o primeiro valor; sem ele, só adiciona um valor a uma praça existente. */
  pedirNome?: boolean;
  rotuloAcao: string;
  aoSalvar: (dados: { nome: string; valor: number; vigenteDesde: string }) => Promise<void>;
  aoCancelar?: () => void;
};

/** Formulário de valor de pedágio (HU10): valor positivo e data de vigência. */
export function ValorPedagioForm({ pedirNome = false, rotuloAcao, aoSalvar, aoCancelar }: Props) {
  const uid = useId();
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [vigenteDesde, setVigenteDesde] = useState(hojeIso());
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const numero = Number(valor.trim().replace(",", "."));
  const invalido = (pedirNome && !nome.trim()) || valor.trim() === "" || Number.isNaN(numero) || numero < 0 || !vigenteDesde;

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await aoSalvar({ nome: nome.trim(), valor: numero, vigenteDesde });
      setNome("");
      setValor("");
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
