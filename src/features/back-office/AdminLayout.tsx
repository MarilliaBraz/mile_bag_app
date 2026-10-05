import { NavLink, Outlet } from "react-router-dom";
import { BotaoSair } from "../../shared/auth/BotaoSair";
import { Icone } from "../../shared/ui/Icone";
import { PreferenciasAcessibilidade } from "../../shared/ui/PreferenciasAcessibilidade";

type Item = { para: string; rotulo: string };

/** Moldura das áreas administrativas: navegação por papel + área de conteúdo. */
export function AdminLayout({ titulo, itens }: { titulo: string; itens: Item[] }) {
  return (
    <div className="admin">
      <header className="admin-topo">
        <span className="marca">
          <img src="/icone-app.svg" alt="" /> {titulo}
        </span>
        <nav aria-label="Seções" className="menu-admin">
          {itens.map((item, indice) => (
            <NavLink key={item.para} to={item.para} end accessKey={String(indice + 1)} title={`Atalho: Alt+Shift+${indice + 1}`}>
              {item.rotulo}
            </NavLink>
          ))}
        </nav>
        <div className="admin-topo-acoes">
          <NavLink to="/conta/senha">
            <Icone nome="chave" />
            &nbsp;Minha senha
          </NavLink>
          <BotaoSair />
        </div>
      </header>
      <div className="admin-conteudo">
        <Outlet />
      </div>
      <PreferenciasAcessibilidade />
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
