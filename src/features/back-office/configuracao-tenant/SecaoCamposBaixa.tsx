import { useEffect, useState } from "react";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { listarCamposBaixa, salvarCamposBaixa, type CampoBaixa, type CampoObrigatorio } from "./configuracoesTenantApi";
import { Alerta } from "../../../shared/ui/Alerta";
import { Painel } from "../layout/Pagina";

const ROTULO: Record<CampoBaixa, string> = {
  POD_FOTO_DOCUMENTO: "Comprovante: foto do documento",
  POD_IDENTIFICACAO_RECEBEDOR: "Comprovante: identificação de quem recebeu",
  POD_DATA_HORA: "Comprovante: data e hora",
  POD_GEOLOCALIZACAO: "Comprovante: localização",
  OCORRENCIA_DESCRICAO_ADICIONAL: "Ocorrência: descrição adicional",
};

/** Quais campos do comprovante e da ocorrência o motorista é obrigado a preencher (HU11, RI10). */
export function SecaoCamposBaixa() {
  const { dados, erro, recarregar } = useRecurso(listarCamposBaixa, "Não foi possível carregar os campos.");
  const [campos, setCampos] = useState<CampoObrigatorio[]>([]);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    if (dados) {
      setCampos(dados);
    }
  }, [dados]);

  async function salvar() {
    setErroAcao(null);
    setSalvo(false);
    try {
      setCampos(await salvarCamposBaixa(campos));
      setSalvo(true);
      await recarregar();
    } catch (excecao) {
      setErroAcao(mensagemDeErro(excecao, "Não foi possível salvar os campos."));
    }
  }

  return (
    <Painel titulo="Campos obrigatórios na baixa" descricao="O que o motorista precisa preencher no comprovante e na ocorrência.">
      {(erro || erroAcao) && <Alerta tipo="erro">{erro ?? erroAcao}</Alerta>}
      {salvo && (
        <Alerta tipo="sucesso" aoFechar={() => setSalvo(false)}>
          Campos salvos.
        </Alerta>
      )}
      <div style={{ display: "grid", gap: "0.125rem", marginBottom: "1rem" }}>
        {campos.map((item) => (
          <label key={item.campo} className="interruptor">
            <input
              type="checkbox"
              checked={item.obrigatorio}
              onChange={(e) => {
                setSalvo(false);
                setCampos(campos.map((c) => (c.campo === item.campo ? { ...c, obrigatorio: e.target.checked } : c)));
              }}
            />
            {ROTULO[item.campo]}
          </label>
        ))}
      </div>
      <button type="button" onClick={salvar} disabled={campos.length === 0}>
        Salvar campos
      </button>
    </Painel>
  );
}
