import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmarAcao } from "../../../../shared/components/ConfirmarAcao";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { descartarBagagem } from "../services/bagagensService";

/** "Descartar" com confirmação (HU34, HU35): apaga o rascunho e a foto e volta ao início. */
export function DescartarRascunho({ id }: { id: string }) {
  const t = useTextos().companhia.bagagens;
  const navigate = useNavigate();
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button type="button" className="perigo-contorno bloco" onClick={() => setAberto(true)}>
        {t.descartar}
      </button>
      <ConfirmarAcao
        aberto={aberto}
        titulo={t.descartarTitulo}
        descricao={t.descartarDescricao}
        rotuloConfirmar={t.descartar}
        perigo
        aoConfirmar={async () => {
          await descartarBagagem(id).catch(() => undefined);
          navigate("/companhia/inicio", { replace: true });
        }}
        aoCancelar={() => setAberto(false)}
      />
    </>
  );
}
