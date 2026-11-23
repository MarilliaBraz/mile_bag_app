import { useLocation, useNavigate } from "react-router-dom";
import { useAvisoViagemNaoIniciada } from "../hooks/useAvisoViagemNaoIniciada";
import { useTextos } from "../utils/i18n/idioma";
import { Icone } from "./Icone";

/** Aviso de "bagagem retirada e viagem não iniciada" quando o motorista já se afastou do local, em todas as telas. */
export function AvisoViagemNaoIniciada() {
  const t = useTextos().motorista.avisoViagemNaoIniciada;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { entregaId, fechar } = useAvisoViagemNaoIniciada();
  const destino = `/motorista/entregas/${entregaId}/rota`;

  // Na própria tela de rota o botão "Iniciar viagem" já está à vista.
  if (!entregaId || pathname === destino) {
    return null;
  }

  return (
    <div className="aviso-bdo-novo nao-imprimir" role="alert">
      <Icone nome="alerta" />
      <p>
        <strong>{t.titulo}</strong> <span>{t.texto}</span>
      </p>
      <button type="button" className="secundario" onClick={() => navigate(destino, { viewTransition: true })}>
        {t.iniciar}
      </button>
      <button type="button" className="botao-icone" onClick={fechar} aria-label={t.fechar} title={t.fechar}>
        <Icone nome="fechar" />
      </button>
    </div>
  );
}
