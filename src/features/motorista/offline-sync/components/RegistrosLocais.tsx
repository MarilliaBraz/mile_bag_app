import { liveQuery } from "dexie";
import { useEffect, useState } from "react";
import { limparFalhas, listarFalhas, type FalhaRegistrada } from "../../../../shared/utils/registroFalhas";
import { formatarDataHora } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Icone, type NomeIcone } from "../../../../shared/components/Icone";
import { bancoLocal } from "../../../../shared/services/db";
import type { RegistroPendente, StatusRegistro } from "../../../../shared/types/offlineSync";
import { Alerta, Carregando, Vazio } from "../../../../shared/components/Alerta";
import { TelaMotorista } from "../../../../shared/components/TelaMotorista";
import { useSincronizacaoAutomatica } from "../../../../shared/hooks/useSincronizacaoAutomatica";

const STATUS: Record<StatusRegistro, { icone: NomeIcone; tom: "aviso" | "sucesso" | "erro" }> = {
  PENDENTE: { icone: "sincronizar", tom: "aviso" },
  SINCRONIZADO: { icone: "checkCirculo", tom: "sucesso" },
  ERRO: { icone: "alerta", tom: "erro" },
};

const LIMITE = 50;

/**
 * Status de cada registro feito neste aparelho (RI05): o motorista vê, item a
 * item, o que já chegou ao back-office, o que ainda espera conexão e o que o
 * servidor recusou (com o motivo) - sem precisar reenviar foto por outro canal.
 */
export function RegistrosLocais() {
  const [registros, setRegistros] = useState<RegistroPendente[] | null>(null);
  const [sincronizando, setSincronizando] = useState(false);
  const { online, sincronizarAgora } = useSincronizacaoAutomatica();
  const [falhas, setFalhas] = useState<FalhaRegistrada[]>(() => listarFalhas());
  const t = useTextos().motorista.registros;

  useEffect(() => {
    const assinatura = liveQuery(() => bancoLocal.registrosPendentes.orderBy("sequenciaLocal").reverse().limit(LIMITE).toArray()).subscribe(
      {
        next: setRegistros,
        error: () => setRegistros([]),
      },
    );
    return () => assinatura.unsubscribe();
  }, []);

  async function enviarAgora() {
    setSincronizando(true);
    await sincronizarAgora();
    setSincronizando(false);
  }

  const aguardando = registros?.filter((r) => r.status !== "SINCRONIZADO").length ?? 0;

  return (
    <TelaMotorista titulo={t.titulo} voltarPara="/motorista/conta" rotuloVoltar={t.voltarConta}>
      <p className="texto-apoio">{t.explicacao}</p>

      <div className="cartao" style={{ margin: "1rem 0" }}>
        <button type="button" className="bloco" onClick={enviarAgora} disabled={!online || sincronizando || aguardando === 0}>
          <Icone nome="sincronizar" /> {sincronizando ? t.enviando : aguardando > 0 ? t.enviarAgoraQuantos(aguardando) : t.enviarAgora}
        </button>
        {!online && <p className="texto-apoio centro">{t.semConexao}</p>}
        {online && aguardando === 0 && registros && registros.length > 0 && (
          <p role="status" className="texto-apoio centro texto-sucesso">
            <Icone nome="checkCirculo" /> {t.tudoEnviado}
          </p>
        )}
      </div>

      {!registros && <Carregando />}
      {registros && registros.length === 0 && <Vazio icone="sincronizar" titulo={t.nenhum} />}

      {registros && registros.length > 0 && (
        <ul className="lista">
          {registros.map((registro) => {
            const status = STATUS[registro.status];
            return (
              <li key={registro.idLocal} className="cartao">
                <div className="cartao-cabecalho">
                  <strong>{t.tipos[registro.tipoEvento] ?? registro.tipoEvento}</strong>
                  <span className={`selo selo-${status.tom}`}>
                    <Icone nome={status.icone} /> {t.situacoes[registro.status]}
                  </span>
                </div>
                <div className="texto-apoio">{formatarDataHora(registro.timestampCriacaoLocal)}</div>
                {registro.status === "ERRO" && (
                  <Alerta tipo="erro">
                    {registro.motivo ?? t.naoAceito} {t.tentativas(registro.tentativas)}
                  </Alerta>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {registros && registros.length >= LIMITE && <p className="texto-apoio">{t.mostrando(LIMITE)}</p>}

      {/* RNF11: falhas inesperadas guardadas só neste aparelho, para conferência do suporte. */}
      {falhas.length > 0 && (
        <section>
          <h2>{t.falhasRecentes(falhas.length)}</h2>
          <ul className="lista-simples">
            {falhas.map((falha) => (
              <li key={falha.dataHora + falha.tela}>
                <span>
                  {formatarDataHora(falha.dataHora)} — {falha.tela}
                  <br />
                  <span className="texto-apoio">{falha.mensagem}</span>
                  {falha.local && (
                    <details>
                      <summary className="texto-apoio">{t.ondeAconteceu}</summary>
                      <pre className="mono fs-xs quebrar" style={{ whiteSpace: "pre-wrap" }}>
                        {falha.local}
                      </pre>
                    </details>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="fantasma compacto"
            onClick={() => {
              limparFalhas();
              setFalhas([]);
            }}
          >
            {t.limparFalhas}
          </button>
        </section>
      )}
    </TelaMotorista>
  );
}
