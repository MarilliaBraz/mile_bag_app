import { formatarNumero } from "../../../../shared/utils/formatar";

export function formatarDistancia(metros: number): string {
  return `${formatarNumero(metros / 1000, 1)} km`;
}

export function formatarDuracao(segundos: number): string {
  const minutos = Math.round(segundos / 60);
  if (minutos < 60) {
    return `${minutos} min`;
  }
  return `${Math.floor(minutos / 60)} h ${String(minutos % 60).padStart(2, "0")} min`;
}
