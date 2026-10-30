import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { TelaAcompanhamento } from "./features/acompanhamento";
import { EsqueciSenha, Login, RedefinirSenha, TrocarSenha } from "./features/auth";
import { IdentidadeVisualForm, TelaConfiguracoes } from "./features/back-office/configuracao-tenant";
import { AvisoEmergenciasAbertas, TelaEmergencias } from "./features/back-office/emergencias";
import { DetalheFechamento, TelaFechamentos } from "./features/back-office/fechamento";
import { AdminLayout, ITENS_COMPANHIA, ITENS_FUNCIONARIO_COMPANHIA, ITENS_PLATAFORMA, ITENS_TENANT } from "./features/back-office/layout";
import { TelaCompanhias } from "./features/back-office/companhias-aereas";
import { TelaMotoristas } from "./features/back-office/motoristas";
import { TelaFuncionarios } from "./features/companhia/funcionarios";
import {
  TelaBuscaNacional,
  TelaConsultaBagagens,
  TelaEtiquetaSid,
  TelaFichaBagagem,
  TelaInicioCompanhia,
  TelaRegistrarEtiqueta,
  TelaRegistrarSemEtiqueta,
} from "./features/companhia/bagagens";
import { TelaPedagios } from "./features/back-office/pedagios";
import { PlanosLista } from "./features/back-office/planos";
import { TelaTarifas } from "./features/back-office/tarifas";
import { AtivarConviteForm, TelaEmpresas, TenantCadastradoConfirmacao } from "./features/back-office/tenant-onboarding";
import { CapturaBdo } from "./features/motorista/captura-bdo";
import { RegistrarComprovante } from "./features/motorista/comprovante-entrega";
import { TelaConta } from "./features/motorista/conta";
import { TelaEmergencia } from "./features/motorista/emergencia";
import { RegistrarOcorrencia } from "./features/motorista/ocorrencia";
import { RegistrosLocais } from "./features/motorista/offline-sync";
import { DetalheEntrega, PainelEntregas } from "./features/motorista/painel-entregas";
import { RelatorioQuinzenal } from "./features/motorista/relatorio-quinzenal";
import { TelaRota } from "./features/motorista/rota";
import { AcessibilidadeDeRota } from "./shared/components/AcessibilidadeDeRota";
import { FaixaAmbiente } from "./shared/components/FaixaAmbiente";
import { LimiteDeFalha } from "./shared/components/LimiteDeFalha";
import { AvisoSessaoExpirada } from "./shared/components/AvisoSessaoExpirada";
import { RequireAuth } from "./shared/components/RequireAuth";
import { obterPapel } from "./shared/services/authStorage";
import { useTextos } from "./shared/utils/i18n/idioma";

// HU38: a página institucional vai num pedaço à parte (com o motion), para não pesar o app do motorista.
const PaginaInstitucional = lazy(() => import("./features/institucional").then((m) => ({ default: m.PaginaInstitucional })));

export function App() {
  // RNF11: uma falha numa tela não derruba o app; mudar de rota sai do estado de falha.
  const { pathname } = useLocation();
  // Acompanhar o idioma aqui redesenha o app inteiro na troca, inclusive datas e números formatados fora dos componentes.
  const t = useTextos();
  return (
    <>
      <AcessibilidadeDeRota />
      <FaixaAmbiente />
      <AvisoSessaoExpirada />
      <LimiteDeFalha key={pathname}>
        <Routes>
          <Route
            path="/"
            element={
              <Suspense fallback={null}>
                <PaginaInstitucional />
              </Suspense>
            }
          />
          <Route path="/login" element={<Login />} />
          {/* O e-mail de convite (HU15) usa /convites/{token}; /convite/{token} continua valendo por compatibilidade. */}
          <Route path="/convites/:token" element={<AtivarConviteForm />} />
          <Route path="/convite/:token" element={<AtivarConviteForm />} />
          <Route path="/esqueci-senha" element={<EsqueciSenha />} />
          <Route path="/redefinir-senha/:token" element={<RedefinirSenha />} />
          {/* HU31: link "Acompanhe sua bagagem" enviado ao passageiro, que não tem conta. */}
          <Route path="/acompanhar/:codigo" element={<TelaAcompanhamento />} />
          <Route element={<RequireAuth papeis={["MOTORISTA"]} />}>
            <Route path="/motorista" element={<PainelEntregas />} />
            <Route path="/motorista/emergencia" element={<TelaEmergencia />} />
          </Route>
          <Route element={<RequireAuth />}>
            <Route path="/motorista/entregas/:entregaId" element={<DetalheEntrega />} />
            <Route path="/motorista/entregas/:entregaId/rota" element={<TelaRota />} />
            <Route path="/motorista/entregas/:entregaId/comprovante" element={<RegistrarComprovante />} />
            <Route path="/motorista/entregas/:entregaId/ocorrencia" element={<RegistrarOcorrencia />} />
            <Route path="/motorista/relatorio" element={<RelatorioQuinzenal />} />
            <Route path="/motorista/registros" element={<RegistrosLocais />} />
            <Route path="/motorista/conta" element={<TelaConta />} />
            <Route path="/motorista/captura-bdo" element={<CapturaBdo />} />
            <Route path="/conta/senha" element={<TrocarSenha />} />
          </Route>
          <Route
            path="/admin"
            element={
              <RequireAuth papeis={["ADMINISTRADOR_TENANT"]}>
                <AdminLayout titulo={t.menu.administracao} itens={ITENS_TENANT} aviso={<AvisoEmergenciasAbertas />} />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="tarifas" replace />} />
            <Route path="motoristas" element={<TelaMotoristas />} />
            <Route path="emergencias" element={<TelaEmergencias />} />
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
                <AdminLayout titulo={t.menu.plataforma} itens={ITENS_PLATAFORMA} />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="empresas" replace />} />
            <Route path="empresas" element={<TelaEmpresas />} />
            <Route path="empresas/:tenantId" element={<TenantCadastradoConfirmacao />} />
            <Route path="planos" element={<PlanosLista />} />
            <Route path="companhias" element={<TelaCompanhias />} />
          </Route>
          {/* HU33: companhia aérea - o administrador cadastra os funcionários; o funcionário tem a área própria.
              HU36: consulta, ficha e busca nacional para os dois perfis, cada um com o seu menu. */}
          <Route
            path="/companhia"
            element={
              <RequireAuth papeis={["ADMINISTRADOR_COMPANHIA", "FUNCIONARIO_COMPANHIA"]}>
                <AdminLayout
                  titulo={t.menu.companhiaAerea}
                  itens={obterPapel() === "FUNCIONARIO_COMPANHIA" ? ITENS_FUNCIONARIO_COMPANHIA : ITENS_COMPANHIA}
                />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="funcionarios" replace />} />
            <Route element={<RequireAuth papeis={["ADMINISTRADOR_COMPANHIA"]} />}>
              <Route path="funcionarios" element={<TelaFuncionarios />} />
            </Route>
            <Route path="bagagens" element={<TelaConsultaBagagens />} />
            <Route path="bagagens/:id" element={<TelaFichaBagagem />} />
            <Route path="busca-nacional" element={<TelaBuscaNacional />} />
          </Route>
          <Route
            path="/companhia/inicio"
            element={
              <RequireAuth papeis={["FUNCIONARIO_COMPANHIA"]}>
                <TelaInicioCompanhia />
              </RequireAuth>
            }
          />
          {/* HU34 e HU35: registro de bagagem encontrada, com etiqueta (foto da etiqueta) e sem etiqueta (descrição e código SID). */}
          <Route element={<RequireAuth papeis={["FUNCIONARIO_COMPANHIA", "ADMINISTRADOR_COMPANHIA"]} />}>
            <Route path="/companhia/registrar" element={<TelaRegistrarEtiqueta />} />
            <Route path="/companhia/registrar/:id" element={<TelaRegistrarEtiqueta />} />
            <Route path="/companhia/sem-etiqueta" element={<TelaRegistrarSemEtiqueta />} />
            <Route path="/companhia/sem-etiqueta/:id" element={<TelaRegistrarSemEtiqueta />} />
            <Route path="/companhia/bagagens/:id/etiqueta" element={<TelaEtiquetaSid />} />
          </Route>
          <Route path="*" element={<Navigate to="/motorista" replace />} />
        </Routes>
      </LimiteDeFalha>
    </>
  );
}
