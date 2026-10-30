import { formatarNumero } from "../../../../shared/utils/formatar";

/** "850 m" ou "12,3 km" (no formato do idioma escolhido). */
export function formatarDistancia(metros: number): string {
  return metros < 1000 ? `${formatarNumero(metros)} m` : `${formatarNumero(metros / 1000, 1)} km`;
}
