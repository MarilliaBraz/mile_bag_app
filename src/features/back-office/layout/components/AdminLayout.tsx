import type { ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { BotaoSair } from "../../../../shared/components/BotaoSair";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Icone } from "../../../../shared/components/Icone";
import { PreferenciasAcessibilidade } from "../../../../shared/components/PreferenciasAcessibilidade";
import { SeletorIdioma } from "../../../../shared/components/SeletorIdioma";
import type { ItemMenu } from "../types";

/**
 * Moldura das áreas administrativas: barra lateral com as seções (no
 * computador) ou faixa rolável no topo (no celular), e a área de conteúdo.
 * `aviso` aparece acima de todas as telas da área (ex.: emergências, HU30).
 */
export function AdminLayout({ titulo, itens, aviso }: { titulo: string; itens: ItemMenu[]; aviso?: ReactNode }) {
  const t = useTextos().menu;
  return (
    <div className="admin">
      <aside className="admin-lateral">
        <span className="marca">
          <img src="/icone-app.svg" alt="" /> Milebag
        </span>
        <span className="admin-area texto-apoio">{titulo}</span>

        <nav aria-label={t.secoes} className="menu-admin">
          {itens.map((item, indice) => (
            <NavLink key={item.para} to={item.para} viewTransition accessKey={String(indice + 1)} title={t.atalho(indice + 1)}>
              <Icone nome={item.icone} />
              <span>{t[item.rotulo]}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-lateral-rodape">
          <div className="admin-lateral-preferencias">
            <SeletorIdioma />
            <PreferenciasAcessibilidade />
          </div>
          <NavLink to="/conta/senha" viewTransition className="admin-link-conta">
            <Icone nome="chave" />
            <span>{t.minhaSenha}</span>
          </NavLink>
          <BotaoSair className="fantasma admin-sair" />
        </div>
      </aside>

      <div className="admin-conteudo">
        {aviso}
        <Outlet />
        <div className="admin-preferencias">
          <SeletorIdioma />
          <PreferenciasAcessibilidade />
        </div>
      </div>
    </div>
  );
}
