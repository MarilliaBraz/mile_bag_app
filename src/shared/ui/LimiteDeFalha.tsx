import { Component, type ErrorInfo, type ReactNode } from "react";
import { registrarFalha } from "../diagnostico/registroFalhas";
import { obterTextos } from "../i18n/idioma";
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
    // Componente de classe não usa hooks; o App redesenha tudo quando o idioma muda.
    const t = obterTextos().falhaTela;
    const areaAdministrativa = /^\/(admin|plataforma)/.test(window.location.pathname);
    return (
      <main className="tela-falha" role="alert">
        <Icone nome="alerta" />
        <h1>{t.titulo}</h1>
        <p>{t.texto}</p>
        <button type="button" className="grande bloco" onClick={() => this.setState({ falhou: false })}>
          <Icone nome="sincronizar" /> {t.tentarDeNovo}
        </button>
        <a className="botao secundario bloco mt-3" href={areaAdministrativa ? "/admin" : "/motorista"}>
          {t.voltarInicio}
        </a>
      </main>
    );
  }
}
