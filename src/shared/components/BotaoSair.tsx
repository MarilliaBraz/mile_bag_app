import { useTextos } from "../utils/i18n/idioma";
import { Icone } from "./Icone";
import { useNavigate } from "react-router-dom";
import { limparToken } from "../services/authStorage";
import { desativarNotificacoes } from "../services/notificacoesPush";

/**
 * Encerra a sessão local (descarta o token). O que ainda está na fila offline do motorista fica guardado para o próximo login.
 * Antes, desinscreve o aparelho dos avisos de bagagem nova (HU32): quem sai não deve continuar recebendo.
 */
export function BotaoSair({ className = "secundario" }: { className?: string }) {
  const navigate = useNavigate();
  const t = useTextos().sessao;
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await desativarNotificacoes();
        limparToken();
        navigate("/login", { replace: true });
      }}
    >
      <Icone nome="sair" /> {t.sair}
    </button>
  );
}
