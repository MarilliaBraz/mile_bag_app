import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { limparToken, obterPapel, obterToken, rotaInicialDo, tokenExpirado, type EstadoLogin, type Papel } from "./authStorage";

/** Exige token e, quando informado, um dos papéis permitidos; outro papel volta à sua própria área. */
export function RequireAuth({ children, papeis }: { children: ReactElement; papeis?: Papel[] }): ReactElement {
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
