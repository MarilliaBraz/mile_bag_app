import { Icone, type NomeIcone } from "../../../../shared/ui/Icone";
import { useState } from "react";
import { Alerta } from "../../../../shared/ui/Alerta";
import { ApiError } from "../../../../shared/api/ApiError";
import { obterPosicaoAtual } from "../../../../shared/geo/posicaoAtual";
import { registrarCheckpoint } from "../services/viagemService";
import type { Checkpoint, TipoCheckpoint } from "../types";

const MARCOS: { tipo: Extract<TipoCheckpoint, "A_CAMINHO" | "CHEGADA">; icone: NomeIcone; rotulo: string; registrado: string; confirmacao: string }[] = [
  { tipo: "A_CAMINHO", icone: "carro", rotulo: "Estou a caminho", registrado: "A caminho", confirmacao: "Marco \"a caminho\" registrado." },
  { tipo: "CHEGADA", icone: "pino", rotulo: "Cheguei", registrado: "Chegada", confirmacao: "Marco \"chegada\" registrado." },
];

const hora = (dataHora: string) => new Date(dataHora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

/**
 * Marcos de progresso (HU20) - dois botões de um toque, sem tela
 * intermediária (RI14). A ordem é só uma sugestão visual: nenhum dos dois é
 * pré-condição do outro nem do comprovante (FR-003/FR-004). Cada marco é
 * registrado uma vez por viagem: depois disso o botão mostra o horário e
 * fica desabilitado, para um toque repetido não reenviar o aviso ao
 * passageiro (o servidor também só avisa no primeiro registro). O passageiro
 * é avisado pelo servidor quando houver contato (FR-005) - nada a fazer aqui.
 *
 * <p>Sem GPS o marco é registrado do mesmo jeito (o back-end guarda
 * `ausente = true`): um marco não pode depender de sinal.</p>
 *
 * <p>Exige conexão: o contrato de sincronização offline (HU08) não tem
 * evento de checkpoint.</p>
 */
export function MarcosProgresso({
  entregaId,
  checkpoints = [],
  aoRegistrar,
}: {
  entregaId: string;
  /** Checkpoints já registrados na viagem (TrajetoDetalhado), para saber quais marcos já foram feitos. */
  checkpoints?: Checkpoint[];
  aoRegistrar?: () => void;
}) {
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  // Registrados nesta tela, até a viagem recarregada trazer o checkpoint (evita o botão reabilitar nesse intervalo).
  const [registradosAgora, setRegistradosAgora] = useState<Checkpoint[]>([]);

  const registroDo = (tipo: TipoCheckpoint) =>
    [...checkpoints, ...registradosAgora].filter((checkpoint) => checkpoint.tipo === tipo).sort((a, b) => a.dataHora.localeCompare(b.dataHora))[0];

  async function registrar(tipo: (typeof MARCOS)[number]["tipo"], confirmacao: string) {
    setAviso(null);
    setOcupado(tipo);
    try {
      const posicao = await obterPosicaoAtual(5_000);
      const checkpoint = await registrarCheckpoint(entregaId, tipo, posicao);
      setRegistradosAgora((anteriores) => [...anteriores, checkpoint]);
      setAviso({ tipo: "ok", texto: confirmacao });
      aoRegistrar?.();
    } catch (excecao) {
      const offline = !(excecao instanceof ApiError);
      setAviso({
        tipo: "erro",
        texto: offline
          ? "Sem conexão: este marco precisa de internet para ser registrado. Tente de novo quando a rede voltar."
          : excecao.message,
      });
    } finally {
      setOcupado(null);
    }
  }

  return (
    <section>
      <h2 className="mt-2">Avisar o passageiro</h2>
      <div className="grade-acoes">
        {MARCOS.map((marco) => {
          const registro = registroDo(marco.tipo);
          return registro ? (
            <button key={marco.tipo} type="button" className="grande" disabled aria-label={`${marco.registrado} registrado às ${hora(registro.dataHora)}`}>
              <Icone nome="check" /> {marco.registrado} · {hora(registro.dataHora)}
            </button>
          ) : (
            <button key={marco.tipo} type="button" className="grande" onClick={() => registrar(marco.tipo, marco.confirmacao)} disabled={ocupado !== null}>
              <Icone nome={marco.icone} /> {ocupado === marco.tipo ? "Registrando…" : marco.rotulo}
            </button>
          );
        })}
      </div>
      {aviso && <Alerta tipo={aviso.tipo === "erro" ? "erro" : "sucesso"}>{aviso.texto}</Alerta>}
    </section>
  );
}
