import type { ReactElement } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { limparToken, obterPapel, obterToken, rotaInicialDo, tokenExpirado } from "../services/authStorage";
import type { EstadoLogin, Papel } from "../types/auth";

/**
 * Exige token e, quando informado, um dos papéis permitidos; outro papel volta à sua própria área.
 * Sem `children`, protege as rotas filhas (rota de layout) e as desenha no `<Outlet />`.
 */
export function RequireAuth({ children = <Outlet />, papeis }: { children?: ReactElement; papeis?: Papel[] }): ReactElement {
  const local = useLocation();
  if (tokenExpirado()) {
    limparToken();
    const estado: EstadoLogin = { sessaoExpirada: true, voltarPara: local.pathname + local.search };
    return <Navigate to="/login" replace state={estado} />;
  }
  if (!obterToken()) {
    return <Navigate to="/login" replace />;
  }
  const papel = obterPapel();
  if (papeis && (!papel || !papeis.includes(papel))) {
    return <Navigate to={rotaInicialDo(papel)} replace />;
  }
  return children;
}
