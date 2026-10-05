import { Icone, type NomeIcone } from "../../../../shared/ui/Icone";
import { useState } from "react";
import { Alerta } from "../../../../shared/ui/Alerta";
import { ApiError } from "../../../../shared/api/ApiError";
import { obterPosicaoAtual } from "../../../../shared/geo/posicaoAtual";
import { registrarCheckpoint } from "../services/viagemService";
import type { TipoCheckpoint } from "../types";

const MARCOS: { tipo: Extract<TipoCheckpoint, "A_CAMINHO" | "CHEGADA">; icone: NomeIcone; rotulo: string; confirmacao: string }[] = [
  { tipo: "A_CAMINHO", icone: "carro", rotulo: "Estou a caminho", confirmacao: "Marco \"a caminho\" registrado." },
  { tipo: "CHEGADA", icone: "pino", rotulo: "Cheguei", confirmacao: "Marco \"chegada\" registrado." },
];

/**
 * Marcos de progresso (HU20) - dois botões de um toque, sem tela
 * intermediária (RI14). A ordem é só uma sugestão visual: nenhum dos dois é
 * pré-condição do outro nem do comprovante (FR-003/FR-004), e cada toque
 * cria um novo registro, sem deduplicação. O passageiro é avisado pelo
 * servidor quando houver contato (FR-005) - nada a fazer aqui.
 *
 * <p>Sem GPS o marco é registrado do mesmo jeito (o back-end guarda
 * `ausente = true`): um marco não pode depender de sinal.</p>
 *
 * <p>Exige conexão: o contrato de sincronização offline (HU08) não tem
 * evento de checkpoint.</p>
 */
export function MarcosProgresso({ entregaId, aoRegistrar }: { entregaId: string; aoRegistrar?: () => void }) {
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  async function registrar(tipo: (typeof MARCOS)[number]["tipo"], confirmacao: string) {
    setAviso(null);
    setOcupado(tipo);
    try {
      const posicao = await obterPosicaoAtual(5_000);
      await registrarCheckpoint(entregaId, tipo, posicao);
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
      <h2 style={{ marginTop: "0.5rem" }}>Avisar o passageiro</h2>
      <div className="grade-acoes">
        {MARCOS.map((marco) => (
          <button key={marco.tipo} type="button" className="grande" onClick={() => registrar(marco.tipo, marco.confirmacao)} disabled={ocupado !== null}>
            <Icone nome={marco.icone} /> {ocupado === marco.tipo ? "Registrando…" : marco.rotulo}
          </button>
        ))}
      </div>
      {aviso && <Alerta tipo={aviso.tipo === "erro" ? "erro" : "sucesso"}>{aviso.texto}</Alerta>}
    </section>
  );
}
