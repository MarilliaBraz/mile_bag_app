import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ConfirmarAcao } from "../ui/ConfirmarAcao";
import { EVENTO_SESSAO_EXPIRADA, type EstadoLogin } from "./authStorage";

/**
 * Quando a API responde que a sessão expirou no meio do uso, diz isso com
 * clareza e leva ao login, que depois devolve o usuário a esta tela. Antes a
 * tela só mostrava "Forbidden", com o indicador ainda em "Conectado".
 */
export function AvisoSessaoExpirada() {
  const [aberto, setAberto] = useState(false);
  const navegar = useNavigate();
  const local = useLocation();

  useEffect(() => {
    const abrir = () => setAberto(true);
    window.addEventListener(EVENTO_SESSAO_EXPIRADA, abrir);
    return () => window.removeEventListener(EVENTO_SESSAO_EXPIRADA, abrir);
  }, []);

  if (local.pathname === "/login") {
    return null;
  }

  return (
    <ConfirmarAcao
      aberto={aberto}
      titulo="Sua sessão expirou"
      descricao="Por segurança, é preciso entrar de novo. Depois de entrar, você volta para esta tela."
      rotuloConfirmar="Entrar de novo"
      aoConfirmar={() => {
        setAberto(false);
        const estado: EstadoLogin = { sessaoExpirada: true, voltarPara: local.pathname + local.search };
        navegar("/login", { state: estado });
      }}
      aoCancelar={() => setAberto(false)}
    />
  );
}
