import { useSyncExternalStore } from "react";
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

const TEMAS: { valor: Tema; rotulo: string }[] = [
  { valor: "automatico", rotulo: "Automático" },
  { valor: "claro", rotulo: "Claro" },
  { valor: "escuro", rotulo: "Escuro" },
];

const NOME_TEMA: Record<Tema, string> = { automatico: "automático", claro: "claro", escuro: "escuro" };

/**
 * Preferências de leitura para baixa visão e uso noturno: tamanho do texto,
 * alto contraste e tema, lembrados neste aparelho. O estado vem de
 * preferencias.ts, então todas as cópias deste painel mostram o mesmo valor.
 */
export function PreferenciasAcessibilidade({ aberto = false }: { aberto?: boolean }) {
  const { fonte, contraste, tema } = useSyncExternalStore(assinarPreferencias, obterPreferencias);

  return (
    <details className="ajuda sem-icone nao-imprimir" open={aberto}>
      <summary>
        <Icone nome="contraste" /> Texto, contraste e tema
      </summary>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
        <button
          type="button"
          className="secundario"
          onClick={() => mudarFonte(fonte - PASSO_FONTE)}
          disabled={fonte <= FONTE_MIN}
          aria-label="Diminuir o tamanho do texto"
          style={{ minWidth: "var(--alvo-g)", fontSize: "0.9rem" }}
        >
          A−
        </button>
        <button
          type="button"
          className="secundario"
          onClick={() => mudarFonte(fonte + PASSO_FONTE)}
          disabled={fonte >= FONTE_MAX}
          aria-label="Aumentar o tamanho do texto"
          style={{ minWidth: "var(--alvo-g)", fontSize: "1.2rem" }}
        >
          A+
        </button>
        <button type="button" className="secundario" onClick={alternarContraste} aria-pressed={contraste}>
          <Icone nome="contraste" /> Alto contraste
        </button>
        <div className="segmentado" role="group" aria-label="Tema" style={{ flexBasis: "100%" }}>
          {TEMAS.map((opcao) => (
            <button key={opcao.valor} type="button" aria-pressed={tema === opcao.valor} onClick={() => escolherTema(opcao.valor)} style={{ flex: 1 }}>
              {opcao.rotulo}
            </button>
          ))}
        </div>
        <span role="status" className="texto-apoio" style={{ flexBasis: "100%" }}>
          Texto em {fonte}%.{" "}
          {contraste ? "Alto contraste ligado: o tema fica sempre claro." : `Tema ${NOME_TEMA[tema]}.`}
        </span>
      </div>
    </details>
  );
}
