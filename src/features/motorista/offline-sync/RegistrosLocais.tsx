import { liveQuery } from "dexie";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icone, type NomeIcone } from "../../../shared/ui/Icone";
import { bancoLocal, type RegistroPendente, type StatusRegistro, type TipoEventoSincronizacao } from "./db";
import { IndicadorSincronizacao } from "./IndicadorSincronizacao";
import { useSincronizacaoAutomatica } from "./useSincronizacaoAutomatica";

const ROTULO_TIPO: Record<TipoEventoSincronizacao, string> = {
  BDO_CAPTURADO: "BDO capturado",
  ENTREGA_AUTOATRIBUIDA: "Entrega assumida",
  ROTA_ESCOLHIDA: "Rota escolhida",
  VIAGEM_INICIADA: "Viagem iniciada",
  BAGAGEM_CARONA_VINCULADA: "Bagagem carona vinculada",
  COMPROVANTE_REGISTRADO: "Comprovante de entrega",
  OCORRENCIA_REGISTRADA: "Ocorrência de não entrega",
};

const STATUS: Record<StatusRegistro, { icone: NomeIcone; texto: string; cor: string }> = {
  PENDENTE: { icone: "sincronizar", texto: "Pendente de sincronização", cor: "var(--aviso)" },
  SINCRONIZADO: { icone: "checkCirculo", texto: "Sincronizado com sucesso", cor: "var(--confirmacao)" },
  ERRO: { icone: "alerta", texto: "Falha ao sincronizar", cor: "var(--erro)" },
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

  useEffect(() => {
    const assinatura = liveQuery(() => bancoLocal.registrosPendentes.orderBy("sequenciaLocal").reverse().limit(LIMITE).toArray()).subscribe({
      next: setRegistros,
      error: () => setRegistros([]),
    });
    return () => assinatura.unsubscribe();
  }, []);

  async function enviarAgora() {
    setSincronizando(true);
    await sincronizarAgora();
    setSincronizando(false);
  }

  const aguardando = registros?.filter((r) => r.status !== "SINCRONIZADO").length ?? 0;

  return (
    <main style={{ maxWidth: 560, margin: "2rem auto", padding: "0 1rem" }}>
      <IndicadorSincronizacao />
      <Link to="/motorista">← Voltar para o painel</Link>
      <h1>Registros deste aparelho</h1>
      <p className="texto-apoio">
        Tudo o que você registra fica salvo aqui e é enviado ao escritório assim que houver conexão. Cada item mostra se já chegou.
      </p>

      <div style={{ margin: "1rem 0" }}>
        <button type="button" onClick={enviarAgora} disabled={!online || sincronizando || aguardando === 0}>
          <Icone nome="sincronizar" /> {sincronizando ? "Enviando…" : "Enviar agora"}
        </button>
        {!online && <span className="texto-apoio" style={{ marginLeft: "0.75rem" }}>Sem conexão: o envio recomeça sozinho quando a rede voltar.</span>}
        {online && aguardando === 0 && registros && registros.length > 0 && (
          <span role="status" className="texto-apoio" style={{ marginLeft: "0.75rem" }}>
            Tudo enviado.
          </span>
        )}
      </div>

      {!registros && <p role="status">Carregando…</p>}
      {registros && registros.length === 0 && <p>Nenhum registro feito neste aparelho ainda.</p>}

      {registros && registros.length > 0 && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {registros.map((registro) => {
            const status = STATUS[registro.status];
            return (
              <li key={registro.idLocal} style={{ border: "1px solid var(--borda)", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "0.75rem" }}>
                <strong>{ROTULO_TIPO[registro.tipoEvento] ?? registro.tipoEvento}</strong>
                <div className="texto-apoio">{new Date(registro.timestampCriacaoLocal).toLocaleString("pt-BR")}</div>
                <div style={{ color: status.cor, marginTop: "0.25rem", fontWeight: 600 }}>
                  <Icone nome={status.icone} /> {status.texto}
                </div>
                {registro.status === "ERRO" && (
                  <div role="alert" className="texto-apoio" style={{ color: "var(--erro)" }}>
                    {registro.motivo ?? "O servidor não aceitou este registro."} Tentativas: {registro.tentativas}. O registro continua guardado e será reenviado.
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {registros && registros.length >= LIMITE && <p className="texto-apoio">Mostrando os {LIMITE} registros mais recentes.</p>}
    </main>
  );
}
