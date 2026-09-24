import { useId, useState } from "react";
import { hojeIso, mensagemDeErro } from "../../../shared/format/formatar";
import type { EscopoTarifa, NovaTarifa, Tarifa } from "./tarifasApi";

const ROTULO_ESCOPO: Record<EscopoTarifa, string> = {
  PADRAO: "Padrão da empresa",
  MOTORISTA: "Por motorista",
  REGIAO: "Por região",
};

function paraNumero(texto: string): number | null {
  const limpo = texto.trim().replace(",", ".");
  return limpo === "" ? null : Number(limpo);
}

type Props = {
  /** Sem `tarifa`, é um cadastro (escolhe escopo); com ela, só valores e vigência mudam (o PUT não troca o escopo). */
  tarifa?: Tarifa;
  aoSalvar: (dados: NovaTarifa) => Promise<void>;
  aoCancelar?: () => void;
};

/** Formulário de tarifa (HU09): exige valor fixo e/ou por km (FR-005) e o alvo do escopo escolhido. */
export function TarifaForm({ tarifa, aoSalvar, aoCancelar }: Props) {
  const uid = useId();
  const [escopo, setEscopo] = useState<EscopoTarifa>(tarifa?.escopo ?? "PADRAO");
  const [motoristaId, setMotoristaId] = useState(tarifa?.motoristaId ?? "");
  const [regiao, setRegiao] = useState(tarifa?.regiao ?? "");
  const [valorFixo, setValorFixo] = useState(tarifa?.valorFixo?.toString() ?? "");
  const [valorPorKm, setValorPorKm] = useState(tarifa?.valorPorKm?.toString() ?? "");
  const [vigenteDesde, setVigenteDesde] = useState(tarifa?.vigenteDesde ?? hojeIso());
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const fixo = paraNumero(valorFixo);
  const porKm = paraNumero(valorPorKm);
  const semValor = fixo === null && porKm === null;
  const alvoFaltando = !tarifa && ((escopo === "MOTORISTA" && !motoristaId.trim()) || (escopo === "REGIAO" && !regiao.trim()));
  const invalido = semValor || alvoFaltando || !vigenteDesde || Number.isNaN(fixo) || Number.isNaN(porKm);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await aoSalvar({
        escopo,
        motoristaId: escopo === "MOTORISTA" ? motoristaId.trim() : undefined,
        regiao: escopo === "REGIAO" ? regiao.trim() : undefined,
        valorFixo: fixo,
        valorPorKm: porKm,
        vigenteDesde,
      });
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, "Não foi possível salvar a tarifa."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={enviar} style={{ display: "grid", gap: "0.75rem", maxWidth: 480 }}>
      {erro && (
        <p role="alert" style={{ color: "var(--erro)", margin: 0 }}>
          {erro}
        </p>
      )}

      {!tarifa && (
        <div>
          <label htmlFor={`${uid}-escopo`}>Aplicar a</label>
          <select id={`${uid}-escopo`} value={escopo} onChange={(e) => setEscopo(e.target.value as EscopoTarifa)}>
            {(Object.keys(ROTULO_ESCOPO) as EscopoTarifa[]).map((chave) => (
              <option key={chave} value={chave}>
                {ROTULO_ESCOPO[chave]}
              </option>
            ))}
          </select>
        </div>
      )}

      {!tarifa && escopo === "MOTORISTA" && (
        <div>
          <label htmlFor={`${uid}-motoristaId`}>Identificador do motorista</label>
          <input id={`${uid}-motoristaId`} value={motoristaId} onChange={(e) => setMotoristaId(e.target.value)} placeholder="UUID do motorista" />
        </div>
      )}

      {!tarifa && escopo === "REGIAO" && (
        <div>
          <label htmlFor={`${uid}-regiao`}>Região</label>
          <input id={`${uid}-regiao`} value={regiao} onChange={(e) => setRegiao(e.target.value)} placeholder="Ex.: Zona Sul" />
        </div>
      )}

      <div>
        <label htmlFor={`${uid}-valorFixo`}>Valor fixo por entrega (R$)</label>
        <input id={`${uid}-valorFixo`} inputMode="decimal" value={valorFixo} onChange={(e) => setValorFixo(e.target.value)} />
      </div>
      <div>
        <label htmlFor={`${uid}-valorPorKm`}>Valor por km (R$)</label>
        <input id={`${uid}-valorPorKm`} inputMode="decimal" value={valorPorKm} onChange={(e) => setValorPorKm(e.target.value)} />
      </div>
      {semValor && <p style={{ margin: 0, fontSize: "0.85rem" }}>Informe o valor fixo, o valor por km ou os dois.</p>}

      <div>
        <label htmlFor={`${uid}-vigenteDesde`}>Vigente desde</label>
        <input id={`${uid}-vigenteDesde`} type="date" value={vigenteDesde} onChange={(e) => setVigenteDesde(e.target.value)} />
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="submit" disabled={invalido || salvando}>
          {salvando ? "Salvando…" : tarifa ? "Salvar alterações" : "Cadastrar tarifa"}
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
