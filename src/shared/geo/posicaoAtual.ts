import type { Coordenada } from "../mapa/MapaBase";

export type MotivoFalhaPosicao = "NAO_SUPORTADA" | "CONTEXTO_INSEGURO" | "NEGADA" | "INDISPONIVEL" | "TEMPO_ESGOTADO";

export type ResultadoPosicao = { posicao: Coordenada; motivo: null } | { posicao: null; motivo: MotivoFalhaPosicao };

/** Instrução para o motorista de acordo com o motivo da falha (heurística 9: diz o que fazer, não só que falhou). */
export const ORIENTACAO_FALHA_POSICAO: Record<MotivoFalhaPosicao, string> = {
  NAO_SUPORTADA: "Este navegador não oferece localização. Use o Chrome, Edge ou Safari atualizado.",
  CONTEXTO_INSEGURO: "A localização só funciona em conexão segura (https) ou em localhost. Abra o sistema pelo endereço https.",
  NEGADA:
    "O acesso à localização está bloqueado para este site. Clique no ícone de cadeado ao lado do endereço, escolha Localização, marque Permitir e toque em “Tentar novamente”.",
  INDISPONIVEL:
    "Não foi possível determinar a posição. Confira se a localização do aparelho está ligada (no Windows: Configurações > Privacidade e segurança > Localização) e toque em “Tentar novamente”.",
  TEMPO_ESGOTADO: "A localização demorou demais para responder. Vá para um local aberto, se possível, e toque em “Tentar novamente”.",
};

function pedirPosicao(opcoes: PositionOptions, tempoLimiteMs: number): Promise<ResultadoPosicao> {
  return new Promise((resolver) => {
    // A opção `timeout` do navegador só conta depois da resposta ao prompt de
    // permissão; com o prompt aberto a promessa nunca resolveria. O limite
    // próprio abaixo cobre esse caso (resolver duas vezes é inofensivo).
    const limite = setTimeout(() => resolver({ posicao: null, motivo: "TEMPO_ESGOTADO" }), tempoLimiteMs + 1_000);
    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        clearTimeout(limite);
        resolver({ posicao: { latitude: posicao.coords.latitude, longitude: posicao.coords.longitude }, motivo: null });
      },
      (erro) => {
        clearTimeout(limite);
        const motivo: MotivoFalhaPosicao =
          erro.code === erro.PERMISSION_DENIED ? "NEGADA" : erro.code === erro.TIMEOUT ? "TEMPO_ESGOTADO" : "INDISPONIVEL";
        resolver({ posicao: null, motivo });
      },
      { ...opcoes, timeout: tempoLimiteMs },
    );
  });
}

/**
 * Posição atual do dispositivo (GPS), com o motivo quando falha.
 *
 * <p>Tenta primeiro com alta precisão (GPS) e, se o aparelho não tiver GPS ou
 * ele não responder (comum em notebooks e desktops), tenta de novo com precisão
 * normal (Wi-Fi/rede), que basta para o comprovante e os marcos. Nunca rejeita:
 * a falha volta em `motivo` para a tela orientar o motorista.</p>
 */
export async function obterPosicaoDetalhada(tempoLimiteMs = 10_000): Promise<ResultadoPosicao> {
  if (!("geolocation" in navigator)) {
    return { posicao: null, motivo: "NAO_SUPORTADA" };
  }
  if (!window.isSecureContext) {
    return { posicao: null, motivo: "CONTEXTO_INSEGURO" };
  }

  const alta = await pedirPosicao({ enableHighAccuracy: true, maximumAge: 30_000 }, Math.min(tempoLimiteMs, 8_000));
  if (alta.posicao || alta.motivo === "NEGADA") {
    return alta;
  }
  return pedirPosicao({ enableHighAccuracy: false, maximumAge: 5 * 60_000 }, tempoLimiteMs);
}

/**
 * Posição atual do dispositivo (HU03, HU04): resolve com {@code null} — nunca
 * rejeita — quando não há posição, porque o back-end aceita checkpoint sem
 * coordenadas ({@code ausente = true}) e o fluxo em campo não pode travar por
 * falta de GPS (RI05). Use {@link obterPosicaoDetalhada} quando a tela precisar
 * explicar o motivo.
 */
export async function obterPosicaoAtual(tempoLimiteMs = 10_000): Promise<Coordenada | null> {
  return (await obterPosicaoDetalhada(tempoLimiteMs)).posicao;
}
