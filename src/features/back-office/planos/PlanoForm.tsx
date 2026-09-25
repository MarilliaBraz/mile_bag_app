import { Icone } from "../../../shared/ui/Icone";
import { useState } from "react";
import { mensagemDeErro } from "../../../shared/format/formatar";

/** Novo plano de assinatura (HU16): nome e os dois limites, ambos inteiros positivos. */
export function PlanoForm({ aoSalvar }: { aoSalvar: (dados: { nome: string; limiteMotoristasAtivos: number; limiteVolumeMensalBdos: number }) => Promise<void> }) {
  const [nome, setNome] = useState("");
  const [motoristas, setMotoristas] = useState("");
  const [bdos, setBdos] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const limiteMotoristas = Number(motoristas);
  const limiteBdos = Number(bdos);
  const invalido = !nome.trim() || !Number.isInteger(limiteMotoristas) || limiteMotoristas <= 0 || !Number.isInteger(limiteBdos) || limiteBdos <= 0;

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
      setErro(mensagemDeErro(excecao, "Não foi possível criar o plano."));
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
      <div>
        <label htmlFor="nomePlano">Nome do plano</label>
        <input id="nomePlano" value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div>
        <label htmlFor="limiteMotoristas">Limite de motoristas ativos</label>
        <input id="limiteMotoristas" inputMode="numeric" value={motoristas} onChange={(e) => setMotoristas(e.target.value)} />
      </div>
      <div>
        <label htmlFor="limiteBdos">Limite de BDOs por mês</label>
        <input id="limiteBdos" inputMode="numeric" value={bdos} onChange={(e) => setBdos(e.target.value)} />
      </div>
      <div>
        <button type="submit" disabled={invalido || salvando}>
          {salvando ? "Salvando…" : "Criar plano"}
        </button>
        {salvo && <span role="status" style={{ color: "var(--confirmacao)", alignSelf: "center" }}>
            <Icone nome="checkCirculo" /> Plano criado.
          </span>}
      </div>
    </form>
  );
}
