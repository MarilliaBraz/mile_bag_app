import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout, ITENS_PLATAFORMA, ITENS_TENANT } from "./features/back-office/AdminLayout";
import { IdentidadeVisualForm } from "./features/back-office/configuracao-tenant/IdentidadeVisualForm";
import { TelaConfiguracoes } from "./features/back-office/configuracao-tenant/TelaConfiguracoes";
import { DetalheFechamento } from "./features/back-office/fechamento/DetalheFechamento";
import { TelaFechamentos } from "./features/back-office/fechamento/TelaFechamentos";
import { TelaMotoristas } from "./features/back-office/motoristas/TelaMotoristas";
import { TelaPedagios } from "./features/back-office/pedagios/TelaPedagios";
import { PlanosLista } from "./features/back-office/planos/PlanosLista";
import { TelaTarifas } from "./features/back-office/tarifas/TelaTarifas";
import { AtivarConviteForm } from "./features/back-office/tenant-onboarding/AtivarConviteForm";
import { TelaEmpresas } from "./features/back-office/tenant-onboarding/TelaEmpresas";
import { TenantCadastradoConfirmacao } from "./features/back-office/tenant-onboarding/TenantCadastradoConfirmacao";
import { TelaConta } from "./features/motorista/conta/TelaConta";
import { CapturaBdo } from "./features/motorista/captura-bdo/components/CapturaBdo";
import { DetalheEntrega } from "./features/motorista/painel-entregas/components/DetalheEntrega";
import { PainelEntregas } from "./features/motorista/painel-entregas/components/PainelEntregas";
import { RegistrarComprovante } from "./features/motorista/comprovante-entrega/RegistrarComprovante";
import { RegistrarOcorrencia } from "./features/motorista/ocorrencia/RegistrarOcorrencia";
import { RelatorioQuinzenal } from "./features/motorista/relatorio-quinzenal/RelatorioQuinzenal";
import { TelaRota } from "./features/motorista/rota/components/TelaRota";
import { RegistrosLocais } from "./features/motorista/offline-sync/RegistrosLocais";
import { AcessibilidadeDeRota } from "./shared/ui/AcessibilidadeDeRota";
import { FaixaAmbiente } from "./shared/ui/FaixaAmbiente";
import { EsqueciSenha } from "./shared/auth/EsqueciSenha";
import { Login } from "./shared/auth/Login";
import { RedefinirSenha } from "./shared/auth/RedefinirSenha";
import { TrocarSenha } from "./shared/auth/TrocarSenha";
import { RequireAuth } from "./shared/auth/RequireAuth";

export function App() {
  return (
    <>
      <AcessibilidadeDeRota />
      <FaixaAmbiente />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/motorista"
          element={
            <RequireAuth papeis={["MOTORISTA"]}>
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
          path="/motorista/entregas/:entregaId/rota"
          element={
            <RequireAuth>
              <TelaRota />
            </RequireAuth>
          }
        />
        <Route
          path="/motorista/entregas/:entregaId/comprovante"
          element={
            <RequireAuth>
              <RegistrarComprovante />
            </RequireAuth>
          }
        />
        <Route
          path="/motorista/entregas/:entregaId/ocorrencia"
          element={
            <RequireAuth>
              <RegistrarOcorrencia />
            </RequireAuth>
          }
        />
        <Route
          path="/motorista/relatorio"
          element={
            <RequireAuth>
              <RelatorioQuinzenal />
            </RequireAuth>
          }
        />
        <Route
          path="/motorista/registros"
          element={
            <RequireAuth>
              <RegistrosLocais />
            </RequireAuth>
          }
        />
        <Route
          path="/motorista/conta"
          element={
            <RequireAuth>
              <TelaConta />
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
        {/* O e-mail de convite (HU15) usa /convites/{token}; /convite/{token} continua valendo por compatibilidade. */}
        <Route path="/convites/:token" element={<AtivarConviteForm />} />
        <Route path="/convite/:token" element={<AtivarConviteForm />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/redefinir-senha/:token" element={<RedefinirSenha />} />
        <Route
          path="/conta/senha"
          element={
            <RequireAuth>
              <TrocarSenha />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth papeis={["ADMINISTRADOR_TENANT"]}>
              <AdminLayout titulo="Administração" itens={ITENS_TENANT} />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="tarifas" replace />} />
          <Route path="motoristas" element={<TelaMotoristas />} />
          <Route path="tarifas" element={<TelaTarifas />} />
          <Route path="pedagios" element={<TelaPedagios />} />
          <Route path="configuracoes" element={<TelaConfiguracoes />} />
          <Route path="fechamentos" element={<TelaFechamentos />} />
          <Route path="fechamentos/:fechamentoId" element={<DetalheFechamento />} />
          <Route path="identidade-visual" element={<IdentidadeVisualForm />} />
        </Route>
        <Route
          path="/plataforma"
          element={
            <RequireAuth papeis={["ADMINISTRADOR_PLATAFORMA"]}>
              <AdminLayout titulo="Plataforma" itens={ITENS_PLATAFORMA} />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="empresas" replace />} />
          <Route path="empresas" element={<TelaEmpresas />} />
          <Route path="empresas/:tenantId" element={<TenantCadastradoConfirmacao />} />
          <Route path="planos" element={<PlanosLista />} />
        </Route>
        <Route path="*" element={<Navigate to="/motorista" replace />} />
      </Routes>
    </>
  );
}
