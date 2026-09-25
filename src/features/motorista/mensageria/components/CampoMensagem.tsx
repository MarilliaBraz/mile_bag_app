import { Icone } from "../../../../shared/ui/Icone";
import { useState } from "react";
import { ApiError } from "../../../../shared/api/ApiError";
import { enviarMensagem } from "../services/mensagemService";

/**
 * Campo de envio (HU18, FR-002, RI02/RI12): um texto e um botão - o canal
 * (e-mail e/ou Telegram) é escolhido pelo servidor, nunca pelo motorista
 * (FR-003). Exige conexão: o contrato de sincronização offline (HU08) não
 * tem evento de mensagem.
 */
export function CampoMensagem({ entregaId, aoEnviar }: { entregaId: string; aoEnviar: () => void }) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviada, setEnviada] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!texto.trim()) {
      return;
    }
    setErro(null);
    setEnviada(false);
    setEnviando(true);
    try {
      await enviarMensagem(entregaId, texto.trim());
      setTexto("");
      setEnviada(true);
      aoEnviar();
    } catch (excecao) {
      setErro(
        excecao instanceof ApiError
          ? excecao.message
          : "Sem conexão: não foi possível enviar a mensagem. Tente de novo quando a rede voltar.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} style={{ marginTop: "0.75rem" }}>
      {erro && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {erro}
        </p>
      )}
      <label htmlFor="mensagem">Mensagem ao passageiro</label>
      <textarea id="mensagem" rows={2} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ex.: Estou chegando, pode me receber?" />
      <button type="submit" disabled={!texto.trim() || enviando} style={{ marginTop: "0.5rem" }}>
        {enviando ? "Enviando…" : "Enviar"}
      </button>
      {enviada && (
        <span role="status" style={{ marginLeft: "0.75rem", color: "var(--confirmacao)" }}>
          <Icone nome="checkCirculo" /> Mensagem enviada.
        </span>
      )}
    </form>
  );
}
