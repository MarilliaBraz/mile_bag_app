import { useEffect, useId, useState } from "react";
import { useTextos } from "../utils/i18n/idioma";
import { listarMotivosComOrigem } from "../services/ocorrenciaService";
import type { MotivoOcorrencia } from "../types/ocorrencia";
import { Alerta, Carregando } from "./Alerta";

const TAMANHO_MAXIMO_COMPLEMENTO = 500;

/**
 * V51: motivo da correção (lista da empresa, também sem internet pela cópia do aparelho) e detalhe opcional. Usado no
 * diálogo de voltar a uma etapa e nas telas de corrigir a retirada e a entrega finalizada.
 */
export function CamposMotivoCorrecao({
  motivoId,
  aoMudarMotivo,
  complemento,
  aoMudarComplemento,
}: {
  motivoId: string;
  aoMudarMotivo: (id: string) => void;
  complemento: string;
  aoMudarComplemento: (texto: string) => void;
}) {
  const uid = useId();
  const t = useTextos().correcao;
  const [motivos, setMotivos] = useState<MotivoOcorrencia[] | null>(null);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    listarMotivosComOrigem("CORRECAO")
      .then((resposta) => setMotivos(resposta.motivos))
      .catch(() => setFalhou(true));
  }, []);

  if (falhou || (motivos && motivos.length === 0)) {
    return <Alerta tipo={falhou ? "erro" : "aviso"}>{t.semMotivos}</Alerta>;
  }
  if (motivos === null) {
    return <Carregando />;
  }
  return (
    <div className="pilha">
      <div>
        <label htmlFor={`${uid}-motivo`}>{t.motivo}</label>
        <select id={`${uid}-motivo`} required value={motivoId} onChange={(evento) => aoMudarMotivo(evento.target.value)}>
          <option value="" disabled>
            {t.escolhaMotivo}
          </option>
          {motivos.map((motivo) => (
            <option key={motivo.id} value={motivo.id}>
              {motivo.descricao}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`${uid}-complemento`}>{t.complemento}</label>
        <textarea
          id={`${uid}-complemento`}
          rows={2}
          maxLength={TAMANHO_MAXIMO_COMPLEMENTO}
          value={complemento}
          onChange={(evento) => aoMudarComplemento(evento.target.value)}
        />
      </div>
    </div>
  );
}
