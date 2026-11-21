import { useEffect, useId, useRef, useState } from "react";
import { useTextos } from "../utils/i18n/idioma";
import { CamposMotivoCorrecao } from "./CamposMotivoCorrecao";

/**
 * V51: antes de voltar e alterar uma etapa já concluída, o motorista diz por quê (lista da empresa) e, se quiser,
 * detalha. Funciona sem internet com a cópia da lista guardada no aparelho. Usa <dialog> nativo, como ConfirmarAcao.
 */
export function PedirMotivoCorrecao({
  aberto,
  etapa,
  aoConfirmar,
  aoCancelar,
}: {
  aberto: boolean;
  /** Nome da etapa, para o título ("Corrigir: foto na porta"). */
  etapa: string;
  aoConfirmar: (motivoId: string, complemento: string | null) => void;
  aoCancelar: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const uid = useId();
  const textos = useTextos();
  const t = textos.correcao;
  const [motivoId, setMotivoId] = useState("");
  const [complemento, setComplemento] = useState("");

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) {
      return;
    }
    if (aberto && !dialogo.open) {
      dialogo.showModal();
    } else if (!aberto && dialogo.open) {
      dialogo.close();
    }
  }, [aberto]);

  function limpar() {
    setMotivoId("");
    setComplemento("");
  }

  function confirmar() {
    aoConfirmar(motivoId, complemento.trim() || null);
    limpar();
  }

  function desistir() {
    limpar();
    aoCancelar();
  }

  return (
    <dialog ref={ref} className="confirmacao" aria-labelledby={`${uid}-titulo`} onCancel={desistir}>
      <h2 className="mt-0" id={`${uid}-titulo`}>
        {t.titulo(etapa)}
      </h2>
      <p>{t.explicacao}</p>
      {aberto && (
        <CamposMotivoCorrecao
          motivoId={motivoId}
          aoMudarMotivo={setMotivoId}
          complemento={complemento}
          aoMudarComplemento={setComplemento}
        />
      )}
      <div className="acoes">
        <button type="button" className="secundario" onClick={desistir} autoFocus>
          {textos.comum.voltar}
        </button>
        <button type="button" onClick={confirmar} disabled={!motivoId}>
          {t.liberar}
        </button>
      </div>
    </dialog>
  );
}
