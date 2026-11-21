import { useNavigate } from "react-router-dom";
import { useAvisoBdoNovo, type AvisoBdoNovo as AvisoBdoNovoTipo } from "../hooks/useAvisoBdoNovo";
import { useTextos } from "../utils/i18n/idioma";
import { Icone } from "./Icone";

/** Aviso destacado de bagagem nova (HU32, RI20) e de entrega cancelada pela empresa (V47), em todas as telas do motorista. */
export function AvisoBdoNovo() {
  const t = useTextos().avisoBdo;
  const navigate = useNavigate();
  const { aviso, fechar, cancelamento, fecharCancelamento } = useAvisoBdoNovo();
  return (
    <>
      {cancelamento && (
        <div className="aviso-bdo-novo nao-imprimir" role="alert">
          <Icone nome="alerta" />
          <p>
            <strong>{t.cancelada}</strong> <span>{cancelamento}</span>
          </p>
          <button
            type="button"
            className="secundario"
            onClick={() => {
              fecharCancelamento();
              navigate("/motorista", { viewTransition: true });
            }}
          >
            {t.ver}
          </button>
          <button type="button" className="botao-icone" onClick={fecharCancelamento} aria-label={t.fechar} title={t.fechar}>
            <Icone nome="fechar" />
          </button>
        </div>
      )}
      {aviso && <AvisoBagagemNova aviso={aviso} fechar={fechar} />}
    </>
  );
}

function AvisoBagagemNova({ aviso, fechar }: { aviso: AvisoBdoNovoTipo; fechar: () => void }) {
  const t = useTextos().avisoBdo;
  const navigate = useNavigate();
  return (
    <div className="aviso-bdo-novo nao-imprimir" role="alert">
      <Icone nome="mala" />
      <p>
        <strong>{aviso.quantidade === 1 ? t.titulo : t.varias(aviso.quantidade)}</strong>
        {aviso.numero && <span> · {t.bdo(aviso.numero)}</span>}
      </p>
      <button
        type="button"
        className="secundario"
        onClick={() => {
          fechar();
          navigate("/motorista", { viewTransition: true });
        }}
      >
        {t.ver}
      </button>
      <button type="button" className="botao-icone" onClick={fechar} aria-label={t.fechar} title={t.fechar}>
        <Icone nome="fechar" />
      </button>
    </div>
  );
}
