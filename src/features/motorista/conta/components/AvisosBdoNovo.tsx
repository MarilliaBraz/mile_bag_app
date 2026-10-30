import { useEffect, useState } from "react";
import { Alerta } from "../../../../shared/components/Alerta";
import {
  ativarNotificacoes,
  desativarNotificacoes,
  estadoNotificacoes,
  type EstadoNotificacoes,
} from "../../../../shared/services/notificacoesPush";
import { useTextos } from "../../../../shared/utils/i18n/idioma";

const TOM: Record<EstadoNotificacoes, string> = {
  ativado: "selo-sucesso",
  desativado: "selo-info",
  bloqueado: "selo-aviso",
  indisponivel: "selo-info",
};

/** Controle dos avisos de bagagem nova com o app fechado (HU32, RI20). */
export function AvisosBdoNovo() {
  const t = useTextos().avisoBdo.notificacoes;
  const [estado, setEstado] = useState<EstadoNotificacoes | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    estadoNotificacoes()
      .then(setEstado)
      .catch(() => setEstado("indisponivel"));
  }, []);

  async function alternar() {
    setOcupado(true);
    setFalhou(false);
    try {
      if (estado === "ativado") {
        await desativarNotificacoes();
        setEstado(await estadoNotificacoes());
      } else {
        setEstado(await ativarNotificacoes());
      }
    } catch {
      setFalhou(true);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <section className="cartao pilha">
      <p>
        <strong>{t.titulo}</strong>
      </p>
      <p className="texto-apoio">{t.explicacao}</p>
      {estado && (
        <p>
          <span className={`selo ${TOM[estado]}`}>{t.estados[estado]}</span>
        </p>
      )}
      {estado === "bloqueado" && <p className="texto-apoio">{t.bloqueadoAjuda}</p>}
      {estado === "indisponivel" && <p className="texto-apoio">{t.indisponivelAjuda}</p>}
      {falhou && <Alerta tipo="erro">{t.falha}</Alerta>}
      {(estado === "ativado" || estado === "desativado") && (
        <button type="button" className={estado === "ativado" ? "secundario bloco" : "bloco"} onClick={alternar} disabled={ocupado}>
          {ocupado ? t.aguarde : estado === "ativado" ? t.desativar : t.ativar}
        </button>
      )}
    </section>
  );
}
