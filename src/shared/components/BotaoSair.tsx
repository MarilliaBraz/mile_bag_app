import { useTextos } from "../utils/i18n/idioma";
import { Icone } from "./Icone";
import { useNavigate } from "react-router-dom";
import { limparToken } from "../services/authStorage";

/** Encerra a sessão local (descarta o token). O que ainda está na fila offline do motorista fica guardado para o próximo login. */
export function BotaoSair({ className = "secundario" }: { className?: string }) {
  const navigate = useNavigate();
  const t = useTextos().sessao;
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        limparToken();
        navigate("/login", { replace: true });
      }}
    >
      <Icone nome="sair" /> {t.sair}
    </button>
  );
}
