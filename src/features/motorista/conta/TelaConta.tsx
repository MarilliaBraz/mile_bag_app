import { Link } from "react-router-dom";
import { BotaoSair } from "../../../shared/auth/BotaoSair";
import { Icone } from "../../../shared/ui/Icone";
import { PreferenciasAcessibilidade } from "../../../shared/ui/PreferenciasAcessibilidade";
import { TelaMotorista } from "../layout/TelaMotorista";
import { useSincronizacaoAutomatica } from "../offline-sync/useSincronizacaoAutomatica";

/**
 * Conta do motorista: o que não é do dia a dia (registros do aparelho,
 * senha, preferências de leitura e sair) sai do topo do painel e fica aqui,
 * longe de toques acidentais durante as entregas.
 */
export function TelaConta() {
  const { pendentes } = useSincronizacaoAutomatica();

  return (
    <TelaMotorista titulo="Conta" navegacao>
      <ul className="lista">
        <li>
          <Link to="/motorista/registros" className="cartao-link">
            <Icone nome="sincronizar" />
            <span className="cartao-corpo">
              <strong>Registros do aparelho</strong>
              <span className="texto-apoio em-bloco">
                {pendentes > 0 ? `${pendentes} aguardando envio` : "Tudo o que foi registrado neste celular"}
              </span>
            </span>
            {pendentes > 0 && <span className="selo selo-aviso">{pendentes}</span>}
            <Icone nome="chevron" />
          </Link>
        </li>
        <li>
          <Link to="/conta/senha" className="cartao-link">
            <Icone nome="chave" />
            <span className="cartao-corpo">
              <strong>Minha senha</strong>
              <span className="texto-apoio em-bloco">Trocar a senha de acesso</span>
            </span>
            <Icone nome="chevron" />
          </Link>
        </li>
      </ul>

      <h2>Leitura</h2>
      <PreferenciasAcessibilidade aberto />

      <div className="mt-8">
        <BotaoSair className="perigo-contorno grande bloco" />
        <p className="texto-apoio centro">O que ainda não foi enviado continua guardado para o próximo login.</p>
      </div>
    </TelaMotorista>
  );
}
