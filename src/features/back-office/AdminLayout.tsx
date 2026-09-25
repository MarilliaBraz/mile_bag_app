import { NavLink, Outlet } from "react-router-dom";
import { BotaoSair } from "../../shared/auth/BotaoSair";
import { PreferenciasAcessibilidade } from "../../shared/ui/PreferenciasAcessibilidade";

type Item = { para: string; rotulo: string };

const ESTILO_LINK = ({ isActive }: { isActive: boolean }) => ({
  padding: "0.5rem 0.75rem",
  borderRadius: 6,
  textDecoration: "none",
  fontWeight: isActive ? 700 : 400,
  border: isActive ? "1px solid var(--acao)" : "1px solid var(--borda)",
});

/** Moldura das áreas administrativas: navegação por papel + área de conteúdo. */
export function AdminLayout({ titulo, itens }: { titulo: string; itens: Item[] }) {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "1rem" }}>
      <header style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", marginBottom: "1rem" }}>
        <strong style={{ marginRight: "1rem" }}>{titulo}</strong>
        <nav aria-label="Seções" className="menu-admin">
          {itens.map((item, indice) => (
            <NavLink key={item.para} to={item.para} end style={ESTILO_LINK} accessKey={String(indice + 1)} title={`Atalho: Alt+Shift+${indice + 1}`}>
              {item.rotulo}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/conta/senha" style={ESTILO_LINK}>
          Minha senha
        </NavLink>
        <BotaoSair />
      </header>
      <PreferenciasAcessibilidade />
      <Outlet />
    </div>
  );
}

export const ITENS_TENANT: Item[] = [
  { para: "/admin/motoristas", rotulo: "Motoristas" },
  { para: "/admin/tarifas", rotulo: "Tarifas" },
  { para: "/admin/pedagios", rotulo: "Pedágios" },
  { para: "/admin/configuracoes", rotulo: "Configurações" },
  { para: "/admin/fechamentos", rotulo: "Fechamentos" },
  { para: "/admin/identidade-visual", rotulo: "Identidade visual" },
];

export const ITENS_PLATAFORMA: Item[] = [
  { para: "/plataforma/empresas", rotulo: "Empresas" },
  { para: "/plataforma/planos", rotulo: "Planos" },
];
