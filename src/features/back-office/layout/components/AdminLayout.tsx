import type { CSSProperties } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { BotaoSair } from "../../../../shared/components/BotaoSair";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Icone } from "../../../../shared/components/Icone";
import { PreferenciasAcessibilidade } from "../../../../shared/components/PreferenciasAcessibilidade";
import { SeletorIdioma } from "../../../../shared/components/SeletorIdioma";
import type { ItemMenu } from "../types";
import { Marca } from "../../../../shared/components/Marca";
import { AvisoEmergenciasAbertas } from "../../emergencias";
import { LARGURA_ICONES, LARGURA_MAXIMA, useLarguraMenu } from "../hooks/useLarguraMenu";
import { usePendencias } from "../hooks/usePendencias";

/**
 * Moldura das áreas administrativas: barra lateral com as seções (no
 * computador) ou faixa rolável no topo (no celular), e a área de conteúdo.
 * `comPendencias` (empresa de entrega): balões de pendências no menu e a faixa de emergência (HU30) acima de todas
 * as telas, alimentados pela mesma consulta periódica.
 * Item 6: no computador, a largura do menu se ajusta arrastando a alça da borda, até ficar só com os ícones.
 */
export function AdminLayout({ titulo, itens, comPendencias = false }: { titulo: string; itens: ItemMenu[]; comPendencias?: boolean }) {
  const textos = useTextos();
  const t = textos.menu;
  const sair = textos.sessao.sair;
  const pendencias = usePendencias(comPendencias);
  const menu = useLarguraMenu();
  return (
    <div className={`admin${menu.recolhido ? " admin-recolhido" : ""}`} style={{ "--largura-menu": `${menu.largura}px` } as CSSProperties}>
      <aside className="admin-lateral">
        <span className="marca">
          <Marca />
        </span>
        <span className="admin-area texto-apoio">{titulo}</span>

        <nav aria-label={t.secoes} className="menu-admin">
          {itens.map((item, indice) => (
            <NavLink
              key={item.para}
              to={item.para}
              viewTransition
              accessKey={String(indice + 1)}
              title={menu.recolhido ? `${t[item.rotulo]} - ${t.atalho(indice + 1)}` : t.atalho(indice + 1)}
            >
              <Icone nome={item.icone} />
              <span className="menu-rotulo">{t[item.rotulo]}</span>
              {item.contador && pendencias[item.contador] > 0 && (
                <>
                  <span className="contador-menu" aria-hidden="true">
                    {pendencias[item.contador]}
                  </span>
                  <span className="visualmente-oculto">{t.pendencias(pendencias[item.contador])}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="admin-lateral-rodape">
          <div className="admin-lateral-preferencias">
            <SeletorIdioma />
            <PreferenciasAcessibilidade />
          </div>
          <button
            type="button"
            className="fantasma admin-recolher"
            onClick={menu.alternar}
            aria-expanded={!menu.recolhido}
            title={menu.recolhido ? t.expandirMenu : t.recolherMenu}
          >
            <Icone nome={menu.recolhido ? "chevron" : "voltar"} />
            <span className="menu-rotulo">{menu.recolhido ? t.expandirMenu : t.recolherMenu}</span>
          </button>
          <NavLink to="/conta/senha" viewTransition className="admin-link-conta" title={menu.recolhido ? t.minhaSenha : undefined}>
            <Icone nome="chave" />
            <span>{t.minhaSenha}</span>
          </NavLink>
          <BotaoSair className="fantasma admin-sair" title={menu.recolhido ? sair : undefined} />
        </div>
        <div
          className="admin-alca"
          role="separator"
          aria-orientation="vertical"
          aria-label={t.larguraMenu}
          aria-valuemin={LARGURA_ICONES}
          aria-valuemax={LARGURA_MAXIMA}
          aria-valuenow={menu.largura}
          tabIndex={0}
          onPointerDown={menu.aoPressionar}
          onKeyDown={menu.aoTeclar}
          onDoubleClick={menu.alternar}
        />
      </aside>

      <div className="admin-conteudo">
        {comPendencias && <AvisoEmergenciasAbertas abertos={pendencias.emergencias} />}
        <Outlet />
        <div className="admin-preferencias">
          <SeletorIdioma />
          <PreferenciasAcessibilidade />
        </div>
      </div>
    </div>
  );
}
