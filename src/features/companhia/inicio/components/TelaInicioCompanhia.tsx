import { Link } from "react-router-dom";
import { Alerta } from "../../../../shared/components/Alerta";
import { BotaoSair } from "../../../../shared/components/BotaoSair";
import { Icone } from "../../../../shared/components/Icone";
import { SeletorIdioma } from "../../../../shared/components/SeletorIdioma";
import { useTextos } from "../../../../shared/utils/i18n/idioma";

/** Início do funcionário da companhia aérea (HU33). O registro de bagagens entra aqui a partir da HU34. */
export function TelaInicioCompanhia() {
  const textos = useTextos();
  const t = textos.companhia.inicio;
  return (
    <div className="tela-entrada">
      <main className="pilha">
        <div className="entrada-idioma">
          <SeletorIdioma />
        </div>
        <p className="marca">{t.area}</p>
        <h1>{t.titulo}</h1>
        <p>{t.texto}</p>
        <Alerta tipo="info">{t.emBreve}</Alerta>
        <Link to="/conta/senha" className="cartao-link">
          <Icone nome="chave" />
          <span className="cartao-corpo">
            <strong>{textos.menu.minhaSenha}</strong>
          </span>
          <Icone nome="chevron" />
        </Link>
        <BotaoSair className="perigo-contorno grande bloco" />
      </main>
    </div>
  );
}
