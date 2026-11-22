import { useEffect, useId, useMemo, useRef, useState } from "react";

/** Uma opção da busca: o código (o que é gravado), o texto principal e o de apoio. */
export type OpcaoBusca = { codigo: string; rotulo: string; detalhe?: string };

const LIMITE = 8;

/** Sem acento e em minúsculas: "goiania" acha "Goiânia". */
export function normalizarBusca(texto: string) {
  return texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

/** As opções que têm o termo no código, no rótulo ou no detalhe; código exato primeiro. */
export function filtrarOpcoes(opcoes: OpcaoBusca[], termo: string) {
  const t = normalizarBusca(termo);
  if (!t) {
    return [];
  }
  const exatas = opcoes.filter((o) => normalizarBusca(o.codigo) === t);
  const demais = opcoes.filter(
    (o) => !exatas.includes(o) && [o.codigo, o.rotulo, o.detalhe ?? ""].some((campo) => normalizarBusca(campo).includes(t)),
  );
  return [...exatas, ...demais].slice(0, LIMITE);
}

type Props = {
  id: string;
  rotulo: string;
  placeholder: string;
  semResultado: string;
  opcoes: OpcaoBusca[] | null | undefined;
  aoEscolher: (opcao: OpcaoBusca) => void;
  /** Foca o campo ao aparecer (ex.: depois de "Trocar"). */
  focar?: boolean;
};

/** Campo de busca com sugestões (padrão combobox): digita parte do nome ou do código e escolhe na lista. */
export function BuscaOpcoes({ id, rotulo, placeholder, semResultado, opcoes, aoEscolher, focar }: Props) {
  const idLista = useId();
  const [termo, setTermo] = useState("");
  const [aberta, setAberta] = useState(false);
  const [ativa, setAtiva] = useState(0);
  const sugestoes = useMemo(() => filtrarOpcoes(opcoes ?? [], termo), [opcoes, termo]);
  const mostrar = aberta && termo.trim() !== "";
  const campo = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (focar) {
      campo.current?.focus();
    }
  }, [focar]);

  function escolher(opcao: OpcaoBusca) {
    aoEscolher(opcao);
    setTermo("");
    setAberta(false);
  }

  return (
    <div className="busca-opcoes">
      <label htmlFor={id} className="visualmente-oculto">
        {rotulo}
      </label>
      <input
        ref={campo}
        id={id}
        role="combobox"
        aria-expanded={mostrar && sugestoes.length > 0}
        aria-controls={idLista}
        aria-autocomplete="list"
        aria-activedescendant={mostrar && sugestoes[ativa] ? `${idLista}-${ativa}` : undefined}
        autoComplete="off"
        placeholder={placeholder}
        value={termo}
        onChange={(e) => {
          setTermo(e.target.value);
          setAtiva(0);
          setAberta(true);
        }}
        onBlur={() => setAberta(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setAberta(true);
            setAtiva((n) => Math.max(0, Math.min(n + 1, sugestoes.length - 1)));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setAtiva((n) => Math.max(n - 1, 0));
          } else if (e.key === "Enter" && mostrar && sugestoes[ativa]) {
            e.preventDefault();
            escolher(sugestoes[ativa]);
          } else if (e.key === "Escape") {
            setAberta(false);
          }
        }}
      />
      {/* "Nenhum resultado" fora da lista, anunciado pelo leitor de tela. */}
      <p role="status" className={mostrar && sugestoes.length === 0 ? "texto-apoio" : "visualmente-oculto"}>
        {mostrar && sugestoes.length === 0 ? semResultado : ""}
      </p>
      {mostrar && sugestoes.length > 0 && (
        <ul id={idLista} role="listbox" className="busca-opcoes-lista">
          {sugestoes.map((o, i) => (
            <li
              key={o.codigo}
              id={`${idLista}-${i}`}
              role="option"
              aria-selected={i === ativa}
              // onMouseDown (antes do blur do campo) para a escolha valer.
              onMouseDown={(e) => {
                e.preventDefault();
                escolher(o);
              }}
            >
              <span className="selo selo-info codigo">{o.codigo}</span> {o.rotulo}
              {o.detalhe && <span className="texto-apoio"> · {o.detalhe}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
