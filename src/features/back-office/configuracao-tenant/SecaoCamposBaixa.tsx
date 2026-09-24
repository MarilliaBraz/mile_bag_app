import { useEffect, useState } from "react";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { listarCamposBaixa, salvarCamposBaixa, type CampoBaixa, type CampoObrigatorio } from "./configuracoesTenantApi";

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
    <section aria-labelledby="titulo-campos">
      <h2 id="titulo-campos">Campos obrigatórios na baixa</h2>
      {(erro || erroAcao) && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {erro ?? erroAcao}
        </p>
      )}
      {campos.map((item) => (
        <label key={item.campo} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 400 }}>
          <input
            type="checkbox"
            style={{ width: "auto", minHeight: 0 }}
            checked={item.obrigatorio}
            onChange={(e) => {
              setSalvo(false);
              setCampos(campos.map((c) => (c.campo === item.campo ? { ...c, obrigatorio: e.target.checked } : c)));
            }}
          />
          {ROTULO[item.campo]}
        </label>
      ))}
      <button type="button" style={{ marginTop: "0.75rem" }} onClick={salvar} disabled={campos.length === 0}>
        Salvar campos
      </button>
      {salvo && (
        <span role="status" style={{ marginLeft: "0.75rem", color: "var(--confirmacao)" }}>
          Salvo.
        </span>
      )}
    </section>
  );
}
