import { Link } from "react-router-dom";
import { BotaoSair } from "../../../../shared/components/BotaoSair";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Icone } from "../../../../shared/components/Icone";
import { PreferenciasAcessibilidade } from "../../../../shared/components/PreferenciasAcessibilidade";
import { SeletorIdioma } from "../../../../shared/components/SeletorIdioma";
import { TelaMotorista } from "../../../../shared/components/TelaMotorista";
import { useSincronizacaoAutomatica } from "../../../../shared/hooks/useSincronizacaoAutomatica";
import { AvisosBdoNovo } from "./AvisosBdoNovo";

/**
 * Conta do motorista: o que não é do dia a dia (registros do aparelho,
 * senha, preferências de leitura e sair) sai do topo do painel e fica aqui,
 * longe de toques acidentais durante as entregas.
 */
export function TelaConta() {
  const { pendentes } = useSincronizacaoAutomatica();
  const t = useTextos().motorista.conta;

  return (
    <TelaMotorista titulo={t.titulo} navegacao>
      <ul className="lista">
        <li>
          <Link to="/motorista/registros" className="cartao-link">
            <Icone nome="sincronizar" />
            <span className="cartao-corpo">
              <strong>{t.registros}</strong>
              <span className="texto-apoio em-bloco">{pendentes > 0 ? t.aguardandoEnvio(pendentes) : t.tudoRegistrado}</span>
            </span>
            {pendentes > 0 && <span className="selo selo-aviso">{pendentes}</span>}
            <Icone nome="chevron" />
          </Link>
        </li>
        <li>
          <Link to="/conta/senha" className="cartao-link">
            <Icone nome="chave" />
            <span className="cartao-corpo">
              <strong>{t.minhaSenha}</strong>
              <span className="texto-apoio em-bloco">{t.trocarSenha}</span>
            </span>
            <Icone nome="chevron" />
          </Link>
        </li>
      </ul>

      <div className="mt-5">
        <AvisosBdoNovo />
      </div>

      <h2>{t.idioma}</h2>
      <SeletorIdioma />

      <h2>{t.leitura}</h2>
      <PreferenciasAcessibilidade aberto />

      <div className="mt-8">
        <BotaoSair className="perigo-contorno grande bloco" />
        <p className="texto-apoio centro">{t.guardadoProximoLogin}</p>
      </div>
    </TelaMotorista>
  );
}
