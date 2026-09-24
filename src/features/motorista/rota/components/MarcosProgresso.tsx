import { useState } from "react";
import { ApiError } from "../../../../shared/api/ApiError";
import { obterPosicaoAtual } from "../../../../shared/geo/posicaoAtual";
import { registrarCheckpoint } from "../services/viagemService";
import type { TipoCheckpoint } from "../types";

const MARCOS: { tipo: Extract<TipoCheckpoint, "A_CAMINHO" | "CHEGADA">; rotulo: string; confirmacao: string }[] = [
  { tipo: "A_CAMINHO", rotulo: "🚚 Estou a caminho", confirmacao: "Marco \"a caminho\" registrado." },
  { tipo: "CHEGADA", rotulo: "📍 Cheguei", confirmacao: "Marco \"chegada\" registrado." },
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
    <section style={{ marginTop: "1.5rem" }}>
      <h2>Avisar o passageiro</h2>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {MARCOS.map((marco) => (
          <button key={marco.tipo} onClick={() => registrar(marco.tipo, marco.confirmacao)} disabled={ocupado !== null} style={{ flex: 1, minWidth: 160 }}>
            {ocupado === marco.tipo ? "Registrando…" : marco.rotulo}
          </button>
        ))}
      </div>
      {aviso && (
        <p role={aviso.tipo === "erro" ? "alert" : "status"} style={{ color: aviso.tipo === "erro" ? "var(--erro)" : "var(--confirmacao)" }}>
          {aviso.texto}
        </p>
      )}
    </section>
  );
}
