import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { Icone, type NomeIcone } from "../../../shared/ui/Icone";
import { IndicadorSincronizacao, StatusConexao } from "../offline-sync/IndicadorSincronizacao";
import { useSincronizacaoAutomatica } from "../offline-sync/useSincronizacaoAutomatica";

type ItemNavegacao = { para: string; rotulo: string; icone: NomeIcone; destaque?: boolean; fim?: boolean };

const ITENS: ItemNavegacao[] = [
  { para: "/motorista", rotulo: "Entregas", icone: "casa", fim: true },
  { para: "/motorista/captura-bdo", rotulo: "Capturar", icone: "camera", destaque: true },
  { para: "/motorista/relatorio", rotulo: "Relatório", icone: "documento" },
  { para: "/motorista/conta", rotulo: "Conta", icone: "usuario" },
];

/**
 * Barra de navegação inferior do motorista: as quatro áreas principais ao
 * alcance do polegar, como nos apps de corrida que ele já usa.
 */
function NavegacaoMotorista() {
  return (
    <nav className="nav-inferior nao-imprimir" aria-label="Menu do motorista">
      {ITENS.map((item) => (
        <NavLink key={item.para} to={item.para} end={item.fim} viewTransition className={item.destaque ? "nav-destaque" : undefined}>
          <span className="nav-icone">
            <Icone nome={item.icone} />
          </span>
          {item.rotulo}
        </NavLink>
      ))}
    </nav>
  );
}

/**
 * Moldura comum das telas do motorista: barra superior fixa (voltar +
 * título + estado da conexão), aviso de offline/sincronização (HU08) e, nas
 * telas principais, a navegação inferior. Telas de tarefa (comprovante,
 * ocorrência, rota) ficam sem a barra inferior para manter o foco na ação.
 */
export function TelaMotorista({
  titulo,
  voltarPara,
  rotuloVoltar = "Voltar",
  navegacao = false,
  aoSincronizar,
  acoesTopo,
  children,
}: {
  titulo: string;
  voltarPara?: string;
  rotuloVoltar?: string;
  navegacao?: boolean;
  aoSincronizar?: () => void;
  acoesTopo?: ReactNode;
  children: ReactNode;
}) {
  const { online, pendentes } = useSincronizacaoAutomatica(aoSincronizar);

  return (
    <div className="app-motorista">
      <main className={`tela${navegacao ? " com-nav" : ""}`}>
        <header className="barra-topo">
          {voltarPara && (
            <Link to={voltarPara} viewTransition className="botao-icone nao-imprimir" aria-label={rotuloVoltar} title={rotuloVoltar}>
              <Icone nome="voltar" />
            </Link>
          )}
          <h1>{titulo}</h1>
          {acoesTopo}
          <StatusConexao online={online} pendentes={pendentes} />
        </header>
        <IndicadorSincronizacao online={online} pendentes={pendentes} />
        <div className="tela-conteudo">{children}</div>
      </main>
      {navegacao && <NavegacaoMotorista />}
    </div>
  );
}
