import { NavLink, Outlet } from "react-router-dom";
import { BotaoSair } from "../../../../shared/components/BotaoSair";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Icone } from "../../../../shared/components/Icone";
import { PreferenciasAcessibilidade } from "../../../../shared/components/PreferenciasAcessibilidade";
import { SeletorIdioma } from "../../../../shared/components/SeletorIdioma";
import type { ItemMenu } from "../types";
import { Marca } from "../../../../shared/components/Marca";
import { AvisoEmergenciasAbertas } from "../../emergencias";
import { usePendencias } from "../hooks/usePendencias";

/**
 * Moldura das áreas administrativas: barra lateral com as seções (no
 * computador) ou faixa rolável no topo (no celular), e a área de conteúdo.
 * `comPendencias` (empresa de entrega): balões de pendências no menu e a faixa de emergência (HU30) acima de todas
 * as telas, alimentados pela mesma consulta periódica.
 */
export function AdminLayout({ titulo, itens, comPendencias = false }: { titulo: string; itens: ItemMenu[]; comPendencias?: boolean }) {
  const t = useTextos().menu;
  const pendencias = usePendencias(comPendencias);
  return (
    <div className="admin">
      <aside className="admin-lateral">
        <span className="marca">
          <Marca />
        </span>
        <span className="admin-area texto-apoio">{titulo}</span>

        <nav aria-label={t.secoes} className="menu-admin">
          {itens.map((item, indice) => (
            <NavLink key={item.para} to={item.para} viewTransition accessKey={String(indice + 1)} title={t.atalho(indice + 1)}>
              <Icone nome={item.icone} />
              <span>{t[item.rotulo]}</span>
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
          <NavLink to="/conta/senha" viewTransition className="admin-link-conta">
            <Icone nome="chave" />
            <span>{t.minhaSenha}</span>
          </NavLink>
          <BotaoSair className="fantasma admin-sair" />
        </div>
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
