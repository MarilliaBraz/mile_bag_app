import { useEffect, useId, useRef } from "react";
import { useTextos } from "../utils/i18n/idioma";

type Props = {
  aberto: boolean;
  titulo: string;
  descricao: string;
  rotuloConfirmar: string;
  perigo?: boolean;
  ocupado?: boolean;
  aoConfirmar: () => void;
  aoCancelar: () => void;
};

/** Confirmação antes de uma ação difícil de desfazer. Usa <dialog> nativo: prende o foco, fecha com Esc e devolve o foco ao botão de origem. */
export function ConfirmarAcao({ aberto, titulo, descricao, rotuloConfirmar, perigo, ocupado, aoConfirmar, aoCancelar }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const uid = useId();
  const t = useTextos().comum;

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

  return (
    <dialog ref={ref} className="confirmacao" aria-labelledby={`${uid}-titulo`} aria-describedby={`${uid}-descricao`} onCancel={aoCancelar}>
      <h2 className="mt-0" id={`${uid}-titulo`}>
        {titulo}
      </h2>
      <p id={`${uid}-descricao`}>{descricao}</p>
      <div className="acoes">
        <button type="button" className="secundario" onClick={aoCancelar} autoFocus>
          {t.cancelar}
        </button>
        <button type="button" className={perigo ? "perigo" : undefined} onClick={aoConfirmar} disabled={ocupado}>
          {ocupado ? t.aguarde : rotuloConfirmar}
        </button>
      </div>
    </dialog>
  );
}
