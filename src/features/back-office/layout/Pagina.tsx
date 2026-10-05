import { useEffect, useId, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Icone } from "../../../shared/ui/Icone";

/**
 * Estrutura comum das telas administrativas: título, explicação curta e a
 * ação principal sempre no topo (antes ficava no fim da página, depois da
 * lista inteira).
 */
export function Pagina({
  titulo,
  descricao,
  acoes,
  voltarPara,
  rotuloVoltar = "Voltar",
  children,
}: {
  titulo: ReactNode;
  descricao?: ReactNode;
  acoes?: ReactNode;
  voltarPara?: string;
  rotuloVoltar?: string;
  children: ReactNode;
}) {
  return (
    <main className="pagina">
      {voltarPara && (
        <Link to={voltarPara} className="pagina-voltar">
          <Icone nome="voltar" /> {rotuloVoltar}
        </Link>
      )}
      <header className="pagina-cabecalho">
        <div>
          <h1>{titulo}</h1>
          {descricao && <p className="texto-apoio">{descricao}</p>}
        </div>
        {acoes && <div className="pagina-acoes">{acoes}</div>}
      </header>
      {children}
    </main>
  );
}

/** Bloco de conteúdo com título próprio (lista, formulário, seção de configuração). */
export function Painel({
  titulo,
  descricao,
  acoes,
  children,
  className = "",
}: {
  titulo?: ReactNode;
  descricao?: ReactNode;
  acoes?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <section className={`painel ${className}`.trim()} aria-labelledby={titulo ? id : undefined}>
      {(titulo || acoes) && (
        <div className="painel-cabecalho">
          <div>
            {titulo && <h2 id={id}>{titulo}</h2>}
            {descricao && <p className="texto-apoio">{descricao}</p>}
          </div>
          {acoes && <div className="painel-acoes">{acoes}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/** Número de destaque (total a pagar, pendências...) para leitura rápida antes da tabela. */
export function Indicador({ rotulo, valor, detalhe, tom }: { rotulo: string; valor: ReactNode; detalhe?: ReactNode; tom?: "aviso" | "sucesso" | "erro" }) {
  return (
    <div className={`indicador${tom ? ` indicador-${tom}` : ""}`}>
      <span className="indicador-rotulo">{rotulo}</span>
      <span className="indicador-valor">{valor}</span>
      {detalhe && <span className="texto-apoio">{detalhe}</span>}
    </div>
  );
}

/**
 * Painel lateral (no celular, folha inferior) para criar/editar sem perder a
 * lista de vista. Usa <dialog> nativo: prende o foco, fecha com Esc e
 * devolve o foco ao botão que abriu.
 */
export function Gaveta({
  aberta,
  titulo,
  descricao,
  largura = "normal",
  aoFechar,
  children,
}: {
  aberta: boolean;
  largura?: "normal" | "larga";
  titulo: string;
  descricao?: ReactNode;
  aoFechar: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) {
      return;
    }
    if (aberta && !dialogo.open) {
      dialogo.showModal();
    } else if (!aberta && dialogo.open) {
      dialogo.close();
    }
  }, [aberta]);

  return (
    <dialog
      ref={ref}
      className={`gaveta${largura === "larga" ? " gaveta-larga" : ""}`}
      aria-labelledby={`${id}-titulo`}
      onCancel={(evento) => {
        evento.preventDefault();
        aoFechar();
      }}
      // Toque fora do painel (no fundo escurecido) fecha, como nos apps de referência.
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) {
          aoFechar();
        }
      }}
    >
      <div className="gaveta-corpo">
        <div className="gaveta-cabecalho">
          <div>
            <h2 id={`${id}-titulo`}>{titulo}</h2>
            {descricao && <p className="texto-apoio">{descricao}</p>}
          </div>
          <button type="button" className="botao-icone" onClick={aoFechar} aria-label="Fechar">
            <Icone nome="fechar" />
          </button>
        </div>
        {aberta && children}
      </div>
    </dialog>
  );
}

/** Iniciais do nome para o avatar da lista de motoristas. */
export function Avatar({ nome, apagado = false }: { nome: string; apagado?: boolean }) {
  const iniciais = nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
  return (
    <span className={`avatar${apagado ? " avatar-apagado" : ""}`} aria-hidden="true">
      {iniciais || "?"}
    </span>
  );
}
