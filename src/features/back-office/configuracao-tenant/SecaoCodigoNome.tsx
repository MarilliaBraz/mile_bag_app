import { useState } from "react";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { useTextos } from "../../../shared/i18n/idioma";
import { criarCodigoNome, listarCodigoNome, removerCodigoNome, type CategoriaCodigoNome } from "./configuracoesTenantApi";
import { Alerta } from "../../../shared/ui/Alerta";
import { Icone } from "../../../shared/ui/Icone";
import { Painel } from "../layout/Pagina";

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
  const { dados, erro, recarregar } = useRecurso(() => listarCodigoNome(categoria), t.falhaLista);
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
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
    <Painel titulo={titulo}>
      {(erro || erroAcao) && <Alerta tipo="erro">{erro ?? erroAcao}</Alerta>}
      {dados && dados.length === 0 && <p className="texto-apoio">{t.nenhumaCadastrada}</p>}
      <ul className="lista-simples">
        {dados?.map((item) => (
          <li key={item.id}>
            <span>
              <span className="selo selo-info codigo">{item.codigoIata}</span> {item.nome}
            </span>
            <button
              type="button"
              className="fantasma compacto"
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
          executar(async () => {
            await criarCodigoNome(categoria, { codigoIata: codigo.trim().toUpperCase(), nome: nome.trim() });
            setCodigo("");
            setNome("");
          }, t.falhaCadastrar);
        }}
      >
        <div style={{ flex: "0 0 7rem" }}>
          <label htmlFor={`${categoria}-codigo`} className="visualmente-oculto">
            {rotuloCodigo}
          </label>
          <input
            className="maiusculas"
            id={`${categoria}-codigo`}
            placeholder={t.iata}
            value={codigo}
            maxLength={10}
            onChange={(e) => setCodigo(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`${categoria}-nome`} className="visualmente-oculto">
            {t.nome}
          </label>
          <input id={`${categoria}-nome`} placeholder={t.nome} value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <button type="submit" disabled={!codigo.trim() || !nome.trim()}>
          <Icone nome="mais" /> {t.adicionar}
        </button>
      </form>
    </Painel>
  );
}
