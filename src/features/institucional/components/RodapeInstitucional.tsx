import { Link } from "react-router-dom";
import { PreferenciasAcessibilidade } from "../../../shared/components/PreferenciasAcessibilidade";
import { SeletorIdioma } from "../../../shared/components/SeletorIdioma";
import { useTextos } from "../../../shared/utils/i18n/idioma";
import { linkWhatsApp } from "../constantes";

/** Rodapé (HU38): "Entrar" de novo, idiomas, acessibilidade, contato e o aviso de uso dos dados (LGPD). */
export function RodapeInstitucional() {
  const t = useTextos().institucional;
  return (
    <footer className="inst-rodape">
      <div className="inst-largura inst-rodape-grade">
        <div>
          <p>
            <Link to="/login">{t.entrar}</Link> ·{" "}
            <a href={linkWhatsApp(t.mensagemWhatsapp)} target="_blank" rel="noopener noreferrer">
              {t.whatsapp}
            </a>
          </p>
          <p>{t.rodape.lgpd}</p>
          <p>{t.rodape.direitos(new Date().getFullYear())}</p>
        </div>
        <div>
          <SeletorIdioma />
        </div>
      </div>
      <div className="inst-largura">
        <PreferenciasAcessibilidade />
      </div>
    </footer>
  );
}
