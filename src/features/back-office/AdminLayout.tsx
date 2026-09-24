import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { limparToken } from "../../shared/auth/authStorage";

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
  const navigate = useNavigate();

  function sair() {
    limparToken();
    navigate("/login");
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "1rem" }}>
      <header style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", marginBottom: "1rem" }}>
        <strong style={{ marginRight: "1rem" }}>{titulo}</strong>
        <nav aria-label="Seções" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", flex: 1 }}>
          {itens.map((item) => (
            <NavLink key={item.para} to={item.para} end style={ESTILO_LINK}>
              {item.rotulo}
            </NavLink>
          ))}
        </nav>
        <button type="button" onClick={sair}>
          Sair
        </button>
      </header>
      <Outlet />
    </div>
  );
}

export const ITENS_TENANT: Item[] = [
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
