import { useSyncExternalStore } from "react";
import { useTextos } from "../i18n/idioma";
import { Icone } from "./Icone";
import {
  alternarContraste,
  assinarPreferencias,
  escolherTema,
  FONTE_MAX,
  FONTE_MIN,
  mudarFonte,
  obterPreferencias,
  PASSO_FONTE,
  type Tema,
} from "./preferencias";

const TEMAS: Tema[] = ["automatico", "claro", "escuro"];

/**
 * Preferências de leitura para baixa visão e uso noturno: tamanho do texto,
 * alto contraste e tema, lembrados neste aparelho. O estado vem de
 * preferencias.ts, então todas as cópias deste painel mostram o mesmo valor.
 */
export function PreferenciasAcessibilidade({ aberto = false }: { aberto?: boolean }) {
  const { fonte, contraste, tema } = useSyncExternalStore(assinarPreferencias, obterPreferencias);
  const t = useTextos().preferencias;

  return (
    <details className="ajuda sem-icone nao-imprimir" open={aberto}>
      <summary>
        <Icone nome="contraste" /> {t.titulo}
      </summary>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
        <button
          type="button"
          className="secundario"
          onClick={() => mudarFonte(fonte - PASSO_FONTE)}
          disabled={fonte <= FONTE_MIN}
          aria-label={t.diminuirTexto}
          style={{ minWidth: "var(--alvo-g)", fontSize: "0.9rem" }}
        >
          A−
        </button>
        <button
          type="button"
          className="secundario"
          onClick={() => mudarFonte(fonte + PASSO_FONTE)}
          disabled={fonte >= FONTE_MAX}
          aria-label={t.aumentarTexto}
          style={{ minWidth: "var(--alvo-g)", fontSize: "1.2rem" }}
        >
          A+
        </button>
        <button type="button" className="secundario" onClick={alternarContraste} aria-pressed={contraste}>
          <Icone nome="contraste" /> {t.altoContraste}
        </button>
        <div className="segmentado base-cheia" role="group" aria-label={t.tema}>
          {TEMAS.map((opcao) => (
            <button key={opcao} type="button" aria-pressed={tema === opcao} onClick={() => escolherTema(opcao)} style={{ flex: 1 }}>
              {t.temas[opcao]}
            </button>
          ))}
        </div>
        <span role="status" className="texto-apoio base-cheia">
          {t.textoEm(fonte)} {contraste ? t.contrasteLigado : t.temaAtual(t.temas[tema])}
        </span>
      </div>
    </details>
  );
}
