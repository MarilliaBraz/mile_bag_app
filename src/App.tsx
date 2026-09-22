import { Navigate, Route, Routes } from "react-router-dom";
import { CapturaBdo } from "./features/motorista/captura-bdo/components/CapturaBdo";
import { LoginDev } from "./shared/auth/LoginDev";
import { RequireAuth } from "./shared/auth/RequireAuth";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginDev />} />
      <Route
        path="/motorista/captura-bdo"
        element={
          <RequireAuth>
            <CapturaBdo />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/motorista/captura-bdo" replace />} />
    </Routes>
  );
}
