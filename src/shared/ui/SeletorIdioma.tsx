import { escolherIdioma, IDIOMAS, useIdioma, useTextos, type Idioma } from "../i18n/idioma";

/** Nome de cada idioma escrito nele mesmo: quem não lê português ainda reconhece o seu. */
const NOME: Record<Idioma, string> = { "pt-BR": "Português", es: "Español", en: "English" };

const AZUL_EUA = "#3c3b6e";
const VERMELHO_EUA = "#b22234";

/**
 * Bandeiras em SVG, e não emoji: o Windows mostra os emoji de bandeira
 * como letras ("ES", "US"). São só decoração; o nome do idioma vai no
 * texto oculto do botão.
 */
function Bandeira({ idioma }: { idioma: Idioma }) {
  return (
    <svg className="bandeira" viewBox="0 0 30 20" aria-hidden="true" focusable="false">
      {idioma === "pt-BR" && (
        <>
          <rect width="30" height="20" fill="#009c3b" />
          <polygon points="15,2 28,10 15,18 2,10" fill="#ffdf00" />
          <circle cx="15" cy="10" r="5" fill="#002776" />
          <path d="M10.2 9.1 Q15 7.7 19.9 10.7" stroke="#fff" strokeWidth="0.9" fill="none" />
        </>
      )}
      {idioma === "es" && (
        <>
          <rect width="30" height="20" fill="#aa151b" />
          <rect y="5" width="30" height="10" fill="#f1bf00" />
        </>
      )}
      {idioma === "en" && (
        <>
          <rect width="30" height="20" fill="#fff" />
          {Array.from({ length: 7 }, (_, faixa) => (
            <rect key={faixa} y={(faixa * 2 * 20) / 13} width="30" height={20 / 13} fill={VERMELHO_EUA} />
          ))}
          <rect width="12" height={(7 * 20) / 13} fill={AZUL_EUA} />
          {Array.from({ length: 12 }, (_, estrela) => (
            <circle key={estrela} cx={1.5 + (estrela % 4) * 3} cy={1.6 + Math.floor(estrela / 4) * 3.4} r="0.55" fill="#fff" />
          ))}
        </>
      )}
    </svg>
  );
}

/** Troca o idioma da interface; a escolha fica lembrada neste aparelho. */
export function SeletorIdioma() {
  const idioma = useIdioma();
  const t = useTextos();

  return (
    <div className="segmentado seletor-idioma nao-imprimir" role="group" aria-label={t.idioma.grupo}>
      {IDIOMAS.map((opcao) => (
        <button
          key={opcao}
          type="button"
          aria-pressed={idioma === opcao}
          onClick={() => escolherIdioma(opcao)}
          title={NOME[opcao]}
          lang={opcao}
        >
          <Bandeira idioma={opcao} />
          <span className="visualmente-oculto">{NOME[opcao]}</span>
        </button>
      ))}
    </div>
  );
}
