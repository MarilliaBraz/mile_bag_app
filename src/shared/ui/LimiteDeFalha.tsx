import { Component, type ErrorInfo, type ReactNode } from "react";
import { registrarFalha } from "../diagnostico/registroFalhas";
import { Icone } from "./Icone";

type Estado = { falhou: boolean };

/**
 * Contém uma falha de renderização (RNF11): em vez de tela branca, mostra
 * como seguir. Os registros da fila offline ficam no IndexedDB e não se
 * perdem. Em App.tsx recebe `key` = rota atual, então navegar para outra
 * tela já sai do estado de falha.
 */
export class LimiteDeFalha extends Component<{ children: ReactNode }, Estado> {
  state: Estado = { falhou: false };

  static getDerivedStateFromError(): Estado {
    return { falhou: true };
  }

  componentDidCatch(erro: Error, info: ErrorInfo) {
    registrarFalha(erro, info.componentStack);
  }

  render() {
    if (!this.state.falhou) {
      return this.props.children;
    }
    const areaAdministrativa = /^\/(admin|plataforma)/.test(window.location.pathname);
    return (
      <main className="tela-falha" role="alert">
        <Icone nome="alerta" />
        <h1>Algo deu errado nesta tela</h1>
        <p>O que você já registrou continua salvo neste aparelho. Tente de novo ou volte para o início.</p>
        <button type="button" className="grande bloco" onClick={() => this.setState({ falhou: false })}>
          <Icone nome="sincronizar" /> Tentar de novo
        </button>
        <a className="botao secundario bloco mt-3" href={areaAdministrativa ? "/admin" : "/motorista"}>
          Voltar ao início
        </a>
      </main>
    );
  }
}
