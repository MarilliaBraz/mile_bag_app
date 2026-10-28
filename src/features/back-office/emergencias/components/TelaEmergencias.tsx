import { useState } from "react";
import { atenderAlerta, linkMapa, listarAlertas } from "../../../../shared/services/emergenciaService";
import type { AlertaEmergencia, StatusAlertaEmergencia } from "../../../../shared/types/emergencia";
import { formatarDataHora, mensagemDeErro } from "../../../../shared/utils/formatar";
import { useRecurso } from "../../../../shared/hooks/useRecurso";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Alerta, Carregando, Vazio } from "../../../../shared/components/Alerta";
import { Icone } from "../../../../shared/components/Icone";
import { Pagina, Painel } from "../../../../shared/components/Pagina";

const TOM_SITUACAO: Record<StatusAlertaEmergencia, "erro" | "sucesso" | "info"> = {
  ABERTO: "erro",
  ATENDIDO: "sucesso",
  CANCELADO: "info",
};

const quando = formatarDataHora;

/**
 * Alertas de emergência dos motoristas (HU30): os em aberto primeiro, para
 * atender; depois o histórico, que nunca é apagado (RD16).
 */
export function TelaEmergencias() {
  const t = useTextos().backOffice.emergencias;
  const { dados, erro, recarregar } = useRecurso(() => listarAlertas(), t.falhaCarregar);
  const abertos = dados?.filter((alerta) => alerta.status === "ABERTO") ?? [];
  const encerrados = dados?.filter((alerta) => alerta.status !== "ABERTO") ?? [];

  return (
    <Pagina titulo={t.titulo} descricao={t.descricao}>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {!dados && !erro && <Carregando texto={t.carregando} />}

      {dados && (
        <>
          <Painel titulo={t.emAberto(abertos.length)}>
            {abertos.length === 0 ? (
              <Vazio icone="checkCirculo" titulo={t.nenhumAberto} />
            ) : (
              <ul className="lista">
                {abertos.map((alerta) => (
                  <AlertaAberto key={alerta.id} alerta={alerta} aoAtender={recarregar} />
                ))}
              </ul>
            )}
          </Painel>

          {encerrados.length > 0 && (
            <Painel titulo={t.historico}>
              <ul className="lista-simples">
                {encerrados.map((alerta) => (
                  <li key={alerta.id}>
                    <span>
                      <strong>{alerta.motoristaNome}</strong> — {quando(alerta.dataHora)}
                      {alerta.observacao && <span className="texto-apoio"> · {alerta.observacao}</span>}
                    </span>
                    <span className={`selo selo-${TOM_SITUACAO[alerta.status]}`}>{t.situacoes[alerta.status]}</span>
                  </li>
                ))}
              </ul>
            </Painel>
          )}
        </>
      )}
    </Pagina>
  );
}

function AlertaAberto({ alerta, aoAtender }: { alerta: AlertaEmergencia; aoAtender: () => Promise<unknown> }) {
  const [observacao, setObservacao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const mapa = linkMapa(alerta);
  const textos = useTextos().backOffice;
  const t = textos.emergencias;

  async function atender() {
    setErro(null);
    setEnviando(true);
    try {
      await atenderAlerta(alerta.id, observacao.trim());
      await aoAtender();
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaAtender));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <li className="cartao">
      <div className="cartao-cabecalho">
        <strong>{alerta.motoristaNome}</strong>
        <span className="selo selo-erro">
          <Icone nome="alerta" /> {quando(alerta.dataHora)}
        </span>
      </div>
      <div className="linha-icone texto-apoio">
        <Icone nome="pino" />
        {mapa ? (
          <a href={mapa} target="_blank" rel="noreferrer">
            {t.verNoMapa}
          </a>
        ) : (
          <span>{t.semPosicao}</span>
        )}
      </div>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      <div className="form-linha mt-3">
        <div>
          <label htmlFor={`observacao-${alerta.id}`}>{t.observacao}</label>
          <input
            id={`observacao-${alerta.id}`}
            value={observacao}
            onChange={(evento) => setObservacao(evento.target.value)}
            placeholder={t.observacaoDica}
          />
        </div>
        <button type="button" onClick={atender} disabled={enviando}>
          <Icone nome="checkCirculo" /> {enviando ? textos.geral.salvando : t.marcarAtendido}
        </button>
      </div>
    </li>
  );
}
