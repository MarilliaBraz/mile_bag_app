import { formatarJanela, type JanelaReagendamento } from "../utils/formatar";
import { useTextos } from "../utils/i18n/idioma";
import { Icone } from "./Icone";

/**
 * Janela combinada com o passageiro (HU29, RI17) - destaque informativo; a
 * ordem das listas não muda por causa dela (RN12).
 */
export function AvisoJanelaReagendamento({ janela }: { janela?: JanelaReagendamento | null }) {
  const t = useTextos().contato;
  if (!janela) {
    return null;
  }
  return (
    <div className="linha-icone texto-apoio">
      <Icone nome="calendario" />
      <span>
        <strong>{t.reagendada}</strong> {formatarJanela(janela)}
      </span>
    </div>
  );
}
