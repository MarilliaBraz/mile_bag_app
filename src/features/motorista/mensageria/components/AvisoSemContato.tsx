import { useTextos } from "../../../../shared/i18n/idioma";
import { Alerta } from "../../../../shared/ui/Alerta";

/**
 * Aviso de "sem contato disponível" (HU18, FR-006/FR-007) - no lugar de uma
 * conversa vazia que pareceria um erro. Sem e-mail no BDO não há como
 * convidar o passageiro ao Telegram, então nenhum canal fica disponível; a
 * ligação (HU21), quando houver telefone, continua sendo a alternativa.
 */
export function AvisoSemContato() {
  const t = useTextos().motorista.mensagens;
  return <Alerta tipo="aviso">{t.semContato}</Alerta>;
}
