import { NavLink, Outlet } from "react-router-dom";
import { BotaoSair } from "../../shared/auth/BotaoSair";
import { Icone, type NomeIcone } from "../../shared/ui/Icone";
import { PreferenciasAcessibilidade } from "../../shared/ui/PreferenciasAcessibilidade";

type Item = { para: string; rotulo: string; icone: NomeIcone };

/**
 * Moldura das áreas administrativas: barra lateral com as seções (no
 * computador) ou faixa rolável no topo (no celular), e a área de conteúdo.
 */
export function AdminLayout({ titulo, itens }: { titulo: string; itens: Item[] }) {
  return (
    <div className="admin">
      <aside className="admin-lateral">
        <span className="marca">
          <img src="/icone-app.svg" alt="" /> Milebag
        </span>
        <span className="admin-area texto-apoio">{titulo}</span>

        <nav aria-label="Seções" className="menu-admin">
          {itens.map((item, indice) => (
            <NavLink key={item.para} to={item.para} viewTransition accessKey={String(indice + 1)} title={`Atalho: Alt+Shift+${indice + 1}`}>
              <Icone nome={item.icone} />
              <span>{item.rotulo}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-lateral-rodape">
          <div className="admin-lateral-preferencias">
            <PreferenciasAcessibilidade />
          </div>
          <NavLink to="/conta/senha" viewTransition className="admin-link-conta">
            <Icone nome="chave" />
            <span>Minha senha</span>
          </NavLink>
          <BotaoSair className="fantasma admin-sair" />
        </div>
      </aside>

      <div className="admin-conteudo">
        <Outlet />
        <div className="admin-preferencias">
          <PreferenciasAcessibilidade />
        </div>
      </div>
    </div>
  );
}

export const ITENS_TENANT: Item[] = [
  { para: "/admin/motoristas", rotulo: "Motoristas", icone: "usuarios" },
  { para: "/admin/tarifas", rotulo: "Tarifas", icone: "moeda" },
  { para: "/admin/pedagios", rotulo: "Pedágios", icone: "pedagio" },
  { para: "/admin/fechamentos", rotulo: "Fechamentos", icone: "calendario" },
  { para: "/admin/configuracoes", rotulo: "Configurações", icone: "engrenagem" },
  { para: "/admin/identidade-visual", rotulo: "Identidade visual", icone: "imagem" },
];

export const ITENS_PLATAFORMA: Item[] = [
  { para: "/plataforma/empresas", rotulo: "Empresas", icone: "predio" },
  { para: "/plataforma/planos", rotulo: "Planos", icone: "lista" },
];
