import { formatarNumero } from "../../../../shared/utils/formatar";

/** "45 min", "2 h 15 min", "1 d 3 h": o tempo de ciclo cabe no cartão e se lê de relance. */
export function formatarDuracao(minutos: number | null): string {
  if (minutos === null) {
    return "–";
  }
  const dias = Math.floor(minutos / 1440);
  const horas = Math.floor((minutos % 1440) / 60);
  const resto = minutos % 60;
  if (dias > 0) {
    return horas > 0 ? `${dias} d ${horas} h` : `${dias} d`;
  }
  if (horas > 0) {
    return resto > 0 ? `${horas} h ${resto} min` : `${horas} h`;
  }
  return `${resto} min`;
}

export function formatarPercentual(valor: number | null): string {
  return valor === null ? "–" : `${formatarNumero(valor, valor % 1 === 0 ? 0 : 1)}%`;
}
