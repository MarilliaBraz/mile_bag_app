import { useEffect, useRef, useState } from "react";
import { mensagemDeErro } from "../../../../shared/utils/formatar";
import { useRecurso } from "../../../../shared/hooks/useRecurso";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import {
  criarCodigoNome,
  listarCodigoNome,
  listarOpcoesBusca,
  removerCodigoNome,
  tornarBasePrincipal,
} from "../services/configuracoesTenantService";
import { BuscaOpcoes, type OpcaoBusca } from "../../../../shared/components/BuscaOpcoes";
import type { CategoriaCodigoNome } from "../types";
import { Alerta } from "../../../../shared/components/Alerta";
import { Icone } from "../../../../shared/components/Icone";
import { Painel } from "../../../../shared/components/Pagina";

/** Lista com código IATA + nome, usada para bases aeroportuárias e companhias atendidas (HU11) - mesmo formato nos dois endpoints. */
export function SecaoCodigoNome({
  categoria,
  titulo,
  rotuloCodigo,
}: {
  categoria: CategoriaCodigoNome;
  titulo: string;
  rotuloCodigo: string;
}) {
  const t = useTextos().backOffice.configuracoes;
  const deBases = categoria === "bases-aeroportuarias";
  const { dados, erro, recarregar } = useRecurso(() => listarCodigoNome(categoria), t.falhaLista);
  // V53: escolhe na busca (nome, cidade ou código); o nome vem preenchido e pode ser ajustado.
  const { dados: opcoes, erro: erroOpcoes } = useRecurso(() => listarOpcoesBusca(categoria), t.falhaBusca);
  const [escolhida, setEscolhida] = useState<OpcaoBusca | null>(null);
  const [nome, setNome] = useState("");
  const [trocou, setTrocou] = useState(false);
  const campoNome = useRef<HTMLInputElement>(null);
  // Depois de escolher, o foco vai para o nome (a busca some da tela).
  useEffect(() => {
    if (escolhida) {
      campoNome.current?.focus();
    }
  }, [escolhida]);
  // Já cadastrados não aparecem nas sugestões.
  const jaCadastrados = new Set(dados?.map((item) => item.codigoIata));
  const opcoesLivres = opcoes?.filter((o) => !jaCadastrados.has(o.codigo));
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  async function executar(acao: () => Promise<unknown>, mensagem: string) {
    setErroAcao(null);
    try {
      await acao();
      await recarregar();
    } catch (excecao) {
      setErroAcao(mensagemDeErro(excecao, mensagem));
    }
  }

  return (
    <Painel titulo={titulo} descricao={deBases ? t.basesDescricao : undefined}>
      {(erro || erroAcao || erroOpcoes) && <Alerta tipo="erro">{erro ?? erroAcao ?? erroOpcoes}</Alerta>}
      {dados && dados.length === 0 && <p className="texto-apoio">{t.nenhumaCadastrada}</p>}
      <ul className="lista-simples">
        {dados?.map((item) => (
          <li key={item.id}>
            <span>
              <span className="selo selo-info codigo">{item.codigoIata}</span> {item.nome}
              {deBases && item.cidade && <span className="texto-apoio"> · {t.cidadeDaBase(item.cidade)}</span>}
              {deBases && item.principal && <span className="selo selo-sucesso"> {t.basePrincipal}</span>}
            </span>
            {deBases && !item.principal && (
              <button
                type="button"
                className="fantasma compacto"
                aria-label={t.tornarPrincipalRotulo(item.codigoIata)}
                onClick={() => executar(() => tornarBasePrincipal(item.id), t.falhaTornarPrincipal)}
              >
                {t.tornarPrincipal}
              </button>
            )}
            <button
              type="button"
              className="perigo-fantasma compacto"
              aria-label={t.removerRotulo(item.codigoIata, item.nome)}
              onClick={() => executar(() => removerCodigoNome(categoria, item.id), t.falhaRemover)}
            >
              {t.remover}
            </button>
          </li>
        ))}
      </ul>
      <form
        className="form-linha"
        onSubmit={(evento) => {
          evento.preventDefault();
          if (!escolhida) {
            return;
          }
          executar(async () => {
            await criarCodigoNome(categoria, { codigoIata: escolhida.codigo, nome: nome.trim() });
            setEscolhida(null);
            setNome("");
          }, t.falhaCadastrar);
        }}
      >
        {escolhida ? (
          <div className="escolhida">
            <span className="selo selo-info codigo">{escolhida.codigo}</span> {escolhida.rotulo}{" "}
            <button
              type="button"
              className="fantasma compacto"
              onClick={() => {
                setEscolhida(null);
                setTrocou(true);
              }}
            >
              {t.trocarEscolha}
            </button>
          </div>
        ) : (
          <div>
            <BuscaOpcoes
              id={`${categoria}-busca`}
              rotulo={rotuloCodigo}
              placeholder={deBases ? t.buscarBase : t.buscarCompanhia}
              semResultado={deBases ? t.semAeroporto : t.semCompanhia}
              opcoes={opcoesLivres}
              focar={trocou}
              aoEscolher={(opcao) => {
                setEscolhida(opcao);
                setNome(deBases ? (opcao.detalhe ?? opcao.rotulo) : opcao.rotulo);
              }}
            />
          </div>
        )}
        {escolhida && (
          <div>
            <label htmlFor={`${categoria}-nome`} className="visualmente-oculto">
              {t.nome}
            </label>
            <input ref={campoNome} id={`${categoria}-nome`} placeholder={t.nome} value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
        )}
        <button type="submit" disabled={!escolhida}>
          <Icone nome="mais" /> {t.adicionar}
        </button>
      </form>
    </Painel>
  );
}
