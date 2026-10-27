import { Icone } from "../../../shared/ui/Icone";
import { useId, useState } from "react";
import { hojeIso, mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { useTextos } from "../../../shared/i18n/idioma";
import { listarMotoristas } from "../motoristas/motoristasApi";
import type { EscopoTarifa, NovaTarifa, Tarifa } from "./tarifasApi";
import { Alerta } from "../../../shared/ui/Alerta";

const ESCOPOS: EscopoTarifa[] = ["PADRAO", "MOTORISTA", "REGIAO"];

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
  const textos = useTextos().backOffice;
  const t = textos.tarifas;
  const { dados: motoristas } = useRecurso(listarMotoristas, textos.motoristas.falhaCarregar);
  const [escopo, setEscopo] = useState<EscopoTarifa>(tarifa?.escopo ?? "PADRAO");
  const [motoristaId, setMotoristaId] = useState(tarifa?.motoristaId ?? "");
  const [regiao, setRegiao] = useState(tarifa?.regiao ?? "");
  const [valorFixo, setValorFixo] = useState(tarifa?.valorFixo?.toString() ?? "");
  const [valorPorKm, setValorPorKm] = useState(tarifa?.valorPorKm?.toString() ?? "");
  const [vigenteDesde, setVigenteDesde] = useState(tarifa?.vigenteDesde ?? hojeIso());
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const fixo = paraNumero(valorFixo);
  const porKm = paraNumero(valorPorKm);
  const semValor = fixo === null && porKm === null;
  const alvoFaltando = !tarifa && ((escopo === "MOTORISTA" && !motoristaId.trim()) || (escopo === "REGIAO" && !regiao.trim()));
  const invalido = semValor || alvoFaltando || !vigenteDesde || Number.isNaN(fixo) || Number.isNaN(porKm);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setSalvo(false);
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
      setSalvo(true);
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaSalvar));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="formulario">
      {erro && <Alerta tipo="erro">{erro}</Alerta>}

      {!tarifa && (
        <div>
          <label htmlFor={`${uid}-escopo`}>{t.aplicarA}</label>
          <select id={`${uid}-escopo`} value={escopo} onChange={(e) => setEscopo(e.target.value as EscopoTarifa)}>
            {ESCOPOS.map((chave) => (
              <option key={chave} value={chave}>
                {t.escoposForm[chave]}
              </option>
            ))}
          </select>
        </div>
      )}

      {!tarifa && escopo === "MOTORISTA" && (
        <div>
          <label htmlFor={`${uid}-motoristaId`}>{t.motorista}</label>
          <select id={`${uid}-motoristaId`} value={motoristaId} onChange={(e) => setMotoristaId(e.target.value)}>
            <option value="">{t.escolhaMotorista}</option>
            {motoristas?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
                {m.ativo ? "" : t.desativadoEntreParenteses}
              </option>
            ))}
          </select>
        </div>
      )}

      {!tarifa && escopo === "REGIAO" && (
        <div>
          <label htmlFor={`${uid}-regiao`}>{t.regiao}</label>
          <input id={`${uid}-regiao`} value={regiao} onChange={(e) => setRegiao(e.target.value)} placeholder={t.regiaoExemplo} />
        </div>
      )}

      <div className="form-linha">
        <div>
          <label htmlFor={`${uid}-valorFixo`}>{t.valorFixo}</label>
          <input
            id={`${uid}-valorFixo`}
            inputMode="decimal"
            placeholder={t.exemploValor}
            value={valorFixo}
            onChange={(e) => setValorFixo(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-valorPorKm`}>{t.valorPorKm}</label>
          <input
            id={`${uid}-valorPorKm`}
            inputMode="decimal"
            placeholder={t.exemploValor}
            value={valorPorKm}
            onChange={(e) => setValorPorKm(e.target.value)}
          />
        </div>
      </div>
      {semValor && <p className="texto-apoio m-0">{t.informeValor}</p>}

      <div>
        <label htmlFor={`${uid}-vigenteDesde`}>{t.vigenteDesde}</label>
        <input id={`${uid}-vigenteDesde`} type="date" value={vigenteDesde} onChange={(e) => setVigenteDesde(e.target.value)} />
      </div>

      <div className="linha-acoes">
        <button type="submit" disabled={invalido || salvando}>
          {salvando ? textos.geral.salvando : tarifa ? textos.geral.salvarAlteracoes : t.cadastrar}
        </button>
        {salvo && !aoCancelar && (
          <span role="status" style={{ color: "var(--confirmacao)", alignSelf: "center" }}>
            <Icone nome="checkCirculo" /> {t.salva}
          </span>
        )}
        {aoCancelar && (
          <button type="button" className="secundario" onClick={aoCancelar}>
            {textos.geral.cancelar}
          </button>
        )}
      </div>
    </form>
  );
}
