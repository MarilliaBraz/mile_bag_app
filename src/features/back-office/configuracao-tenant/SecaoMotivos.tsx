import { useState } from "react";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { criarMotivo, desativarMotivo, listarMotivos } from "./configuracoesTenantApi";
import { Alerta } from "../../../shared/ui/Alerta";
import { Icone } from "../../../shared/ui/Icone";
import { Painel } from "../layout/Pagina";

/**
 * Motivos de não entrega (HU11, FR-009): nunca se apaga, só se desativa - as
 * ocorrências antigas continuam apontando para o motivo. A API só lista os
 * ativos, então um motivo desativado some daqui e não há como reativá-lo.
 */
export function SecaoMotivos() {
  const { dados, erro, recarregar } = useRecurso(listarMotivos, "Não foi possível carregar os motivos.");
  const [descricao, setDescricao] = useState("");
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
    <Painel titulo="Motivos de não entrega" descricao="O que o motorista escolhe ao registrar uma ocorrência. Desativar mantém as ocorrências antigas.">
      {(erro || erroAcao) && <Alerta tipo="erro">{erro ?? erroAcao}</Alerta>}
      {dados && dados.length === 0 && <p className="texto-apoio">Nenhum motivo ativo. Sem motivos, o motorista não consegue registrar ocorrências.</p>}
      <ul className="lista-simples">
        {dados?.map((motivo) => (
          <li key={motivo.id}>
            <span>{motivo.descricao}</span>
            <button
              type="button"
              className="fantasma compacto"
              aria-label={`Desativar motivo ${motivo.descricao}`}
              onClick={() => executar(() => desativarMotivo(motivo.id), "Não foi possível desativar o motivo.")}
            >
              Desativar
            </button>
          </li>
        ))}
      </ul>
      <form
        className="form-linha"
        onSubmit={(evento) => {
          evento.preventDefault();
          executar(async () => {
            await criarMotivo(descricao.trim());
            setDescricao("");
          }, "Não foi possível criar o motivo.");
        }}
      >
        <div>
          <label htmlFor="novo-motivo" className="visualmente-oculto">
            Novo motivo
          </label>
          <input id="novo-motivo" placeholder="Novo motivo" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </div>
        <button type="submit" disabled={!descricao.trim()}>
          <Icone nome="mais" /> Adicionar
        </button>
      </form>
    </Painel>
  );
}
