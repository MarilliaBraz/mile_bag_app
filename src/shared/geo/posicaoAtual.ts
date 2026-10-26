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

// Quando a posição por rede chega primeiro, quanto ainda vale esperar pelo GPS, mais preciso.
const CARENCIA_ALTA_PRECISAO_MS = 1_500;

function esperar(ms: number): Promise<null> {
  return new Promise((resolver) => setTimeout(() => resolver(null), ms));
}

/**
 * Posição atual do dispositivo (GPS), com o motivo quando falha.
 *
 * <p>Pede ao mesmo tempo a posição de alta precisão (GPS) e a de precisão
 * normal (Wi-Fi/rede), que basta para o comprovante e os marcos. Se o GPS
 * responder, vale o GPS; se a rede responder antes, espera no máximo
 * {@link CARENCIA_ALTA_PRECISAO_MS} pelo GPS e segue com a rede. Antes os
 * pedidos eram em sequência, e sem GPS (notebooks e desktops) cada ação
 * esperava até 8 s antes de tentar a rede. Nunca rejeita: a falha volta em
 * `motivo` para a tela orientar o motorista.</p>
 */
export async function obterPosicaoDetalhada(tempoLimiteMs = 10_000): Promise<ResultadoPosicao> {
  if (!("geolocation" in navigator)) {
    return { posicao: null, motivo: "NAO_SUPORTADA" };
  }
  if (!window.isSecureContext) {
    return { posicao: null, motivo: "CONTEXTO_INSEGURO" };
  }

  const alta = pedirPosicao({ enableHighAccuracy: true, maximumAge: 30_000 }, tempoLimiteMs);
  const normal = pedirPosicao({ enableHighAccuracy: false, maximumAge: 5 * 60_000 }, tempoLimiteMs);

  const { resultado, ehAlta } = await Promise.race([
    alta.then((resultado) => ({ resultado, ehAlta: true })),
    normal.then((resultado) => ({ resultado, ehAlta: false })),
  ]);
  if (resultado.motivo === "NEGADA") {
    return resultado;
  }
  if (ehAlta) {
    return resultado.posicao ? resultado : normal;
  }
  if (!resultado.posicao) {
    return alta;
  }
  const altaNaCarencia = await Promise.race([alta, esperar(CARENCIA_ALTA_PRECISAO_MS)]);
  return altaNaCarencia?.posicao ? altaNaCarencia : resultado;
}

/**
 * Posição atual do dispositivo (HU03, HU04): resolve com {@code null} (nunca
 * rejeita) quando não há posição, porque o back-end aceita checkpoint sem
 * coordenadas ({@code ausente = true}) e o fluxo em campo não pode travar por
 * falta de GPS (RI05). Use {@link obterPosicaoDetalhada} quando a tela precisar
 * explicar o motivo.
 */
export async function obterPosicaoAtual(tempoLimiteMs = 10_000): Promise<Coordenada | null> {
  return (await obterPosicaoDetalhada(tempoLimiteMs)).posicao;
}
