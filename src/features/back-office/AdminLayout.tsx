import type { ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { BotaoSair } from "../../shared/auth/BotaoSair";
import { useTextos, type ChaveMenu } from "../../shared/i18n/idioma";
import { Icone, type NomeIcone } from "../../shared/ui/Icone";
import { PreferenciasAcessibilidade } from "../../shared/ui/PreferenciasAcessibilidade";
import { SeletorIdioma } from "../../shared/ui/SeletorIdioma";

type Item = { para: string; rotulo: ChaveMenu; icone: NomeIcone };

/**
 * Moldura das áreas administrativas: barra lateral com as seções (no
 * computador) ou faixa rolável no topo (no celular), e a área de conteúdo.
 * `aviso` aparece acima de todas as telas da área (ex.: emergências, HU30).
 */
export function AdminLayout({ titulo, itens, aviso }: { titulo: string; itens: Item[]; aviso?: ReactNode }) {
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

export const ITENS_TENANT: Item[] = [
  { para: "/admin/motoristas", rotulo: "motoristas", icone: "usuarios" },
  { para: "/admin/emergencias", rotulo: "emergencias", icone: "alerta" },
  { para: "/admin/tarifas", rotulo: "tarifas", icone: "moeda" },
  { para: "/admin/pedagios", rotulo: "pedagios", icone: "pedagio" },
  { para: "/admin/fechamentos", rotulo: "fechamentos", icone: "calendario" },
  { para: "/admin/configuracoes", rotulo: "configuracoes", icone: "engrenagem" },
  { para: "/admin/identidade-visual", rotulo: "identidadeVisual", icone: "imagem" },
];

export const ITENS_PLATAFORMA: Item[] = [
  { para: "/plataforma/empresas", rotulo: "empresas", icone: "predio" },
  { para: "/plataforma/planos", rotulo: "planos", icone: "lista" },
];
