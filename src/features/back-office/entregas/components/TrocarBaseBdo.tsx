import { useId, useState } from "react";
import { mensagemDeErro } from "../../../../shared/utils/formatar";
import { useRecurso } from "../../../../shared/hooks/useRecurso";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Alerta } from "../../../../shared/components/Alerta";
import { servicoMotoristas } from "../../../../shared/services/motoristasService";
import { trocarBaseBdo } from "../services/entregasService";
import type { EntregaGestao } from "../types";

const TAMANHO_MAXIMO_MOTIVO = 500;

/**
 * V52 (AG): passar o BDO para outra base antes de alguém assumir (ex.: o texto veio com o aeroporto errado). Motivo
 * obrigatório; a troca fica no histórico da mala e os motoristas da base nova são avisados.
 */
export function TrocarBaseBdo({ linha, aoTrocar }: { linha: EntregaGestao; aoTrocar: (codigo: string) => void }) {
  const uid = useId();
  const t = useTextos().backOffice.entregas.trocarBase;
  const { dados: bases, erro } = useRecurso(() => servicoMotoristas.listarBases?.() ?? Promise.resolve([]), t.falhaBases);
  const [baseId, setBaseId] = useState("");
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const outras = bases?.filter((base) => base.codigoIata !== linha.baseCodigo) ?? [];

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (enviando) {
      return;
    }
    setEnviando(true);
    setErroAcao(null);
    try {
      await trocarBaseBdo(linha.bdoId, baseId, motivo.trim());
      aoTrocar(outras.find((base) => base.id === baseId)?.codigoIata ?? "");
    } catch (excecao) {
      setErroAcao(mensagemDeErro(excecao, t.falha));
    } finally {
      setEnviando(false);
    }
  }

  if (bases && outras.length === 0) {
    return null;
  }
  return (
    <section className="pilha divisor-topo" aria-labelledby={`${uid}-titulo`}>
      <h3 id={`${uid}-titulo`}>{t.titulo}</h3>
      <p className="texto-apoio m-0">{t.descricao(linha.baseCodigo ?? "-")}</p>
      {(erro || erroAcao) && <Alerta tipo="erro">{erroAcao ?? erro}</Alerta>}
      <form className="pilha" onSubmit={(evento) => void enviar(evento)}>
        <div>
          <label htmlFor={`${uid}-base`}>{t.baseNova}</label>
          <select id={`${uid}-base`} required value={baseId} onChange={(evento) => setBaseId(evento.target.value)}>
            <option value="" disabled>
              {t.escolhaBase}
            </option>
            {outras.map((base) => (
              <option key={base.id} value={base.id}>
                {base.codigoIata}
                {base.nome ? ` - ${base.nome}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${uid}-motivo`}>{t.motivo}</label>
          <textarea
            id={`${uid}-motivo`}
            required
            rows={2}
            maxLength={TAMANHO_MAXIMO_MOTIVO}
            value={motivo}
            onChange={(evento) => setMotivo(evento.target.value)}
          />
        </div>
        <div>
          <button type="submit" className="secundario" disabled={!baseId || !motivo.trim() || enviando}>
            {enviando ? t.trocando : t.trocar}
          </button>
        </div>
      </form>
    </section>
  );
}
