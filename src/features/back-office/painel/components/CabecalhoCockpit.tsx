import { formatarHora, formatarNumero } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import type { PainelGestao } from "../types";
import { formatarPercentual } from "../utils/formatarPainel";

/** Frase-resumo do dia, montada dos números de agora: a primeira coisa que o gestor lê. */
export function CabecalhoCockpit({ gestao }: { gestao: PainelGestao }) {
  const t = useTextos().backOffice.painel;
  const { otd, metaOtd, radar, funil } = gestao;
  const atrasadas = radar.atrasadas.length;
  let frase: string;
  if (otd.hoje === null) {
    frase = atrasadas > 0 ? t.resumoAtrasadas(atrasadas) : t.resumoSemEntrega;
  } else if (otd.hoje >= metaOtd) {
    frase = t.resumoAcima(formatarPercentual(otd.hoje), metaOtd);
  } else {
    frase = t.resumoAbaixo(formatarPercentual(otd.hoje), formatarNumero(metaOtd - otd.hoje, 1), metaOtd);
  }
  const hoje = new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long" }).format(new Date(gestao.geradoEm));
  const malasNoDia = funil.aguardandoColeta + funil.emTransito + funil.entreguesHoje;
  return (
    <header className="cockpit-cabecalho">
      <p className="cockpit-marca">{t.titulo}</p>
      <h1>{frase}</h1>
      <p className="texto-apoio">{t.resumoDetalhe(hoje, malasNoDia, formatarHora(gestao.geradoEm))}</p>
    </header>
  );
}
