import { Navigate, Route, Routes } from "react-router-dom";
import { CapturaBdo } from "./features/motorista/captura-bdo/components/CapturaBdo";
import { DetalheEntrega } from "./features/motorista/painel-entregas/components/DetalheEntrega";
import { PainelEntregas } from "./features/motorista/painel-entregas/components/PainelEntregas";
import { LoginDev } from "./shared/auth/LoginDev";
import { RequireAuth } from "./shared/auth/RequireAuth";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginDev />} />
      <Route
        path="/motorista"
        element={
          <RequireAuth>
            <PainelEntregas />
          </RequireAuth>
        }
      />
      <Route
        path="/motorista/entregas/:entregaId"
        element={
          <RequireAuth>
            <DetalheEntrega />
          </RequireAuth>
        }
      />
      <Route
        path="/motorista/captura-bdo"
        element={
          <RequireAuth>
            <CapturaBdo />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/motorista" replace />} />
    </Routes>
  );
}
