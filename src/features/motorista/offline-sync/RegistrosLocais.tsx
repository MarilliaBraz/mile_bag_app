import { liveQuery } from "dexie";
import { useEffect, useState } from "react";
import { Icone, type NomeIcone } from "../../../shared/ui/Icone";
import { bancoLocal, type RegistroPendente, type StatusRegistro, type TipoEventoSincronizacao } from "./db";
import { Alerta, Carregando, Vazio } from "../../../shared/ui/Alerta";
import { TelaMotorista } from "../layout/TelaMotorista";
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

const STATUS: Record<StatusRegistro, { icone: NomeIcone; texto: string; tom: "aviso" | "sucesso" | "erro" }> = {
  PENDENTE: { icone: "sincronizar", texto: "Aguardando envio", tom: "aviso" },
  SINCRONIZADO: { icone: "checkCirculo", texto: "Enviado", tom: "sucesso" },
  ERRO: { icone: "alerta", texto: "Falha no envio", tom: "erro" },
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
    <TelaMotorista titulo="Registros do aparelho" voltarPara="/motorista/conta" rotuloVoltar="Voltar para a conta">
      <p className="texto-apoio">
        Tudo o que você registra fica salvo aqui e é enviado ao escritório assim que houver conexão. Cada item mostra se já chegou.
      </p>

      <div className="cartao" style={{ margin: "1rem 0" }}>
        <button type="button" className="bloco" onClick={enviarAgora} disabled={!online || sincronizando || aguardando === 0}>
          <Icone nome="sincronizar" /> {sincronizando ? "Enviando…" : aguardando > 0 ? `Enviar agora (${aguardando})` : "Enviar agora"}
        </button>
        {!online && <p className="texto-apoio centro">Sem conexão: o envio recomeça sozinho quando a rede voltar.</p>}
        {online && aguardando === 0 && registros && registros.length > 0 && (
          <p role="status" className="texto-apoio centro texto-sucesso">
            <Icone nome="checkCirculo" /> Tudo enviado.
          </p>
        )}
      </div>

      {!registros && <Carregando />}
      {registros && registros.length === 0 && <Vazio icone="sincronizar" titulo="Nenhum registro neste aparelho ainda" />}

      {registros && registros.length > 0 && (
        <ul className="lista">
          {registros.map((registro) => {
            const status = STATUS[registro.status];
            return (
              <li key={registro.idLocal} className="cartao">
                <div className="cartao-cabecalho">
                  <strong>{ROTULO_TIPO[registro.tipoEvento] ?? registro.tipoEvento}</strong>
                  <span className={`selo selo-${status.tom}`}>
                    <Icone nome={status.icone} /> {status.texto}
                  </span>
                </div>
                <div className="texto-apoio">{new Date(registro.timestampCriacaoLocal).toLocaleString("pt-BR")}</div>
                {registro.status === "ERRO" && (
                  <Alerta tipo="erro">
                    {registro.motivo ?? "O servidor não aceitou este registro."} Tentativas: {registro.tentativas}. O registro continua
                    guardado e será reenviado.
                  </Alerta>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {registros && registros.length >= LIMITE && <p className="texto-apoio">Mostrando os {LIMITE} registros mais recentes.</p>}
    </TelaMotorista>
  );
}
