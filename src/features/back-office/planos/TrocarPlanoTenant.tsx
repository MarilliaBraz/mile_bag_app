import { useState } from "react";
import { formatarNumero, mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { useTextos } from "../../../shared/i18n/idioma";
import { ConfirmarAcao } from "../../../shared/ui/ConfirmarAcao";
import { listarPlanos, trocarPlanoDoTenant, type ResultadoTrocaPlano } from "./planosApi";
import { Alerta } from "../../../shared/ui/Alerta";

/**
 * Troca de plano de uma empresa (HU16, FR-006). A troca sempre acontece; se o
 * uso atual da empresa já passa dos limites do novo plano, a resposta traz
 * `usoExcedeuLimiteNaTroca` e a tela avisa - é um alerta, não um bloqueio.
 */
export function TrocarPlanoTenant({ tenantId, planoAtualId, aoTrocar }: { tenantId: string; planoAtualId: string; aoTrocar?: () => void }) {
  const t = useTextos().backOffice.planos;
  const { dados: planos, erro } = useRecurso(listarPlanos, t.falhaCarregar);
  const [escolhido, setEscolhido] = useState("");
  const [resultado, setResultado] = useState<ResultadoTrocaPlano | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [trocando, setTrocando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  async function trocar() {
    setErroAcao(null);
    setResultado(null);
    setTrocando(true);
    try {
      setResultado(await trocarPlanoDoTenant(tenantId, escolhido));
      aoTrocar?.();
    } catch (excecao) {
      setErroAcao(mensagemDeErro(excecao, t.falhaTrocar));
    } finally {
      setTrocando(false);
      setConfirmando(false);
    }
  }

  return (
    <form
      onSubmit={(evento) => {
        evento.preventDefault();
        setConfirmando(true);
      }}
      className="formulario"
    >
      {(erro || erroAcao) && <Alerta tipo="erro">{erro ?? erroAcao}</Alerta>}
      <div>
        <label htmlFor="novoPlano">{t.novoPlanoRotulo}</label>
        <select id="novoPlano" value={escolhido} onChange={(e) => setEscolhido(e.target.value)}>
          <option value="">{t.escolhaPlano}</option>
          {planos
            ?.filter(({ plano }) => plano.id !== planoAtualId)
            .map(({ plano }) => (
              <option key={plano.id} value={plano.id}>
                {t.opcaoPlano(plano.nome, formatarNumero(plano.limiteMotoristasAtivos), formatarNumero(plano.limiteVolumeMensalBdos))}
              </option>
            ))}
        </select>
      </div>
      <div>
        <button type="submit" disabled={!escolhido || trocando}>
          {trocando ? t.trocando : t.trocarPlano}
        </button>
      </div>
      <ConfirmarAcao
        aberto={confirmando}
        titulo={t.trocarTitulo}
        descricao={t.trocarDescricao}
        rotuloConfirmar={t.trocarPlano}
        ocupado={trocando}
        aoConfirmar={trocar}
        aoCancelar={() => setConfirmando(false)}
      />
      {resultado && (
        <Alerta tipo={resultado.usoExcedeuLimiteNaTroca ? "aviso" : "sucesso"}>
          {t.alteradoPara} <strong>{resultado.planoVigente.nome}</strong>.{resultado.usoExcedeuLimiteNaTroca && t.usoExcedeu}
        </Alerta>
      )}
    </form>
  );
}
