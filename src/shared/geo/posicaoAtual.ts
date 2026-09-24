import type { Coordenada } from "../mapa/MapaBase";

/**
 * Posição atual do dispositivo (GPS), usada como origem do cálculo de rota
 * (HU03) e nos checkpoints do trajeto (HU04).
 *
 * <p>Resolve com {@code null} — nunca rejeita — quando o navegador não tem
 * Geolocation, o motorista nega a permissão ou o sinal falha: o back-end
 * aceita checkpoint sem coordenadas ({@code ausente = true}) e o fluxo em
 * campo não pode travar por falta de GPS (RI05).</p>
 */
export function obterPosicaoAtual(tempoLimiteMs = 10_000): Promise<Coordenada | null> {
  if (!("geolocation" in navigator)) {
    return Promise.resolve(null);
  }

  return new Promise((resolver) => {
    // A opção `timeout` do navegador só conta depois da resposta ao prompt de
    // permissão; com o prompt aberto a promessa nunca resolveria. O limite
    // próprio abaixo cobre esse caso (resolver duas vezes é inofensivo).
    const limite = setTimeout(() => resolver(null), tempoLimiteMs + 1_000);
    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        clearTimeout(limite);
        resolver({ latitude: posicao.coords.latitude, longitude: posicao.coords.longitude });
      },
      () => {
        clearTimeout(limite);
        resolver(null);
      },
      { enableHighAccuracy: true, timeout: tempoLimiteMs },
    );
  });
}
