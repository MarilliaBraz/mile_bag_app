import { useEffect, useState } from "react";
import { mensagemDeErro } from "../../../../shared/utils/formatar";
import { useRecurso } from "../../../../shared/hooks/useRecurso";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { listarCamposBaixa, salvarCamposBaixa } from "../services/configuracoesTenantService";
import type { CampoObrigatorio } from "../types";
import { Alerta } from "../../../../shared/components/Alerta";
import { Painel } from "../../../../shared/components/Pagina";

/** Quais campos do comprovante e da ocorrência o motorista é obrigado a preencher (HU11, RI10). */
export function SecaoCamposBaixa() {
  const t = useTextos().backOffice.configuracoes;
  const { dados, erro, recarregar } = useRecurso(listarCamposBaixa, t.falhaCampos);
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
      setErroAcao(mensagemDeErro(excecao, t.falhaSalvarCampos));
    }
  }

  return (
    <Painel titulo={t.camposTitulo} descricao={t.camposDescricao}>
      {(erro || erroAcao) && <Alerta tipo="erro">{erro ?? erroAcao}</Alerta>}
      {salvo && (
        <Alerta tipo="sucesso" aoFechar={() => setSalvo(false)}>
          {t.camposSalvos}
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
            {t.campos[item.campo]}
          </label>
        ))}
      </div>
      <button type="button" onClick={salvar} disabled={campos.length === 0}>
        {t.salvarCampos}
      </button>
    </Painel>
  );
}
