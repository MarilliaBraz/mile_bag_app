import { Icone } from "../../../shared/ui/Icone";
import { useState } from "react";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useTextos } from "../../../shared/i18n/idioma";
import { Alerta } from "../../../shared/ui/Alerta";

/** Novo plano de assinatura (HU16): nome e os dois limites, ambos inteiros positivos. */
export function PlanoForm({
  aoSalvar,
}: {
  aoSalvar: (dados: { nome: string; limiteMotoristasAtivos: number; limiteVolumeMensalBdos: number }) => Promise<void>;
}) {
  const [nome, setNome] = useState("");
  const [motoristas, setMotoristas] = useState("");
  const [bdos, setBdos] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const textos = useTextos().backOffice;
  const t = textos.planos;

  const limiteMotoristas = Number(motoristas);
  const limiteBdos = Number(bdos);
  const invalido =
    !nome.trim() || !Number.isInteger(limiteMotoristas) || limiteMotoristas <= 0 || !Number.isInteger(limiteBdos) || limiteBdos <= 0;

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setSalvo(false);
    setSalvando(true);
    try {
      await aoSalvar({ nome: nome.trim(), limiteMotoristasAtivos: limiteMotoristas, limiteVolumeMensalBdos: limiteBdos });
      setNome("");
      setMotoristas("");
      setBdos("");
      setSalvo(true);
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaCriar));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="formulario">
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      <div>
        <label htmlFor="nomePlano">{t.nomePlano}</label>
        <input id="nomePlano" value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div className="form-linha">
        <div>
          <label htmlFor="limiteMotoristas">{t.motoristasAtivos}</label>
          <input id="limiteMotoristas" inputMode="numeric" value={motoristas} onChange={(e) => setMotoristas(e.target.value)} />
        </div>
        <div>
          <label htmlFor="limiteBdos">{t.bdosPorMes}</label>
          <input id="limiteBdos" inputMode="numeric" value={bdos} onChange={(e) => setBdos(e.target.value)} />
        </div>
      </div>
      <p className="texto-apoio m-0">{t.limitesInteiros}</p>
      <div className="linha-acoes">
        <button type="submit" disabled={invalido || salvando}>
          {salvando ? textos.geral.salvando : t.criarPlano}
        </button>
        {salvo && (
          <span role="status" style={{ color: "var(--confirmacao)", alignSelf: "center" }}>
            <Icone nome="checkCirculo" /> {t.planoCriado}
          </span>
        )}
      </div>
    </form>
  );
}
