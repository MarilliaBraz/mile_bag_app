import { useTextos } from "../../../../shared/i18n/idioma";
import { Icone } from "../../../../shared/ui/Icone";

/**
 * Ligação direta ao passageiro (HU21) - link `tel:` padrão, tratado pelo
 * próprio sistema operacional do dispositivo: não há API de telefonia nem
 * registro da chamada (Assumptions do spec desta HU).
 *
 * <p>Não renderiza nada quando o BDO não tem telefone capturado (FR-002,
 * Acceptance Scenario 3) - sem número, não há o que discar. A validação de
 * formato do número não é responsabilidade desta HU (Edge Case): um número
 * incompleto continua sendo oferecido, e quem trata isso é o dispositivo.</p>
 */
export function BotaoLigar({ telefone }: { telefone: string | null }) {
  const t = useTextos().motorista.mensagens;
  if (!telefone || !telefone.trim()) {
    return null;
  }

  return (
    <a href={`tel:${telefone.replace(/\D/g, "")}`} className="botao grande secundario" aria-label={t.ligarPara}>
      <Icone nome="telefone" /> {t.ligar}
    </a>
  );
}
