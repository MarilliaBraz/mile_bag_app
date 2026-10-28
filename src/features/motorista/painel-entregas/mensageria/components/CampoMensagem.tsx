import { Icone } from "../../../../../shared/components/Icone";
import { useState } from "react";
import { ApiError } from "../../../../../shared/services/ApiError";
import { useTextos } from "../../../../../shared/utils/i18n/idioma";
import { Alerta } from "../../../../../shared/components/Alerta";
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
  const t = useTextos().motorista.mensagens;

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
      setErro(excecao instanceof ApiError ? excecao.message : t.semConexaoEnviar);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="mt-4" onSubmit={enviar}>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      <label htmlFor="mensagem">{t.mensagemAoPassageiro}</label>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
        <textarea id="mensagem" rows={2} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={t.exemplo} />
        <button type="submit" disabled={!texto.trim() || enviando} style={{ minHeight: "var(--alvo-g)", flex: "none" }}>
          <Icone nome="enviar" /> {enviando ? t.enviando : t.enviar}
        </button>
      </div>
      {enviada && (
        <p role="status" className="texto-apoio texto-sucesso">
          <Icone nome="checkCirculo" /> {t.enviada}
        </p>
      )}
    </form>
  );
}
