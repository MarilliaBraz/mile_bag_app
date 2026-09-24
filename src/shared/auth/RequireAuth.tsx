import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { obterPapel, obterToken, rotaInicialDo, type Papel } from "./authStorage";

/** Exige token e, quando informado, um dos papéis permitidos; outro papel volta à sua própria área. */
export function RequireAuth({ children, papeis }: { children: ReactElement; papeis?: Papel[] }): ReactElement {
  if (!obterToken()) {
    return <Navigate to="/login" replace />;
  }
  const papel = obterPapel();
  if (papeis && (!papel || !papeis.includes(papel))) {
    return <Navigate to={rotaInicialDo(papel)} replace />;
  }
  return children;
}
