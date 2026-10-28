import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTextos } from "../utils/i18n/idioma";
import { ConfirmarAcao } from "./ConfirmarAcao";
import { EVENTO_SESSAO_EXPIRADA } from "../services/authStorage";
import type { EstadoLogin } from "../types/auth";

/**
 * Quando a API responde que a sessão expirou no meio do uso, diz isso com
 * clareza e leva ao login, que depois devolve o usuário a esta tela. Antes a
 * tela só mostrava "Forbidden", com o indicador ainda em "Conectado".
 */
export function AvisoSessaoExpirada() {
  const [aberto, setAberto] = useState(false);
  const navegar = useNavigate();
  const local = useLocation();
  const t = useTextos().sessao;

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
      titulo={t.titulo}
      descricao={t.descricao}
      rotuloConfirmar={t.entrarDeNovo}
      aoConfirmar={() => {
        setAberto(false);
        const estado: EstadoLogin = { sessaoExpirada: true, voltarPara: local.pathname + local.search };
        navegar("/login", { state: estado });
      }}
      aoCancelar={() => setAberto(false)}
    />
  );
}
