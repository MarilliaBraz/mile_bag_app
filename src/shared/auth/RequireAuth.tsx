import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { obterToken } from "./authStorage";

export function RequireAuth({ children }: { children: ReactElement }): ReactElement {
  if (!obterToken()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
