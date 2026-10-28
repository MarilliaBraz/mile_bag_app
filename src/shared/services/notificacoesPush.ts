import { requisitar } from "./httpClient";

/** Estado dos avisos com o app fechado neste aparelho (HU32, RI20). */
export type EstadoNotificacoes = "ativado" | "desativado" | "bloqueado" | "indisponivel";

// A chave não muda durante a sessão; `null` = push desligado no ambiente (204).
let chavePublica: Promise<string | null> | null = null;

function obterChavePublica(): Promise<string | null> {
  chavePublica ??= requisitar<{ chavePublica: string } | undefined>("/api/v1/notificacoes/chave-publica")
    .then((resposta) => resposta?.chavePublica ?? null)
    .catch(() => {
      chavePublica = null;
      return null;
    });
  return chavePublica;
}

function suportado(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

async function inscricaoAtual(): Promise<PushSubscription | null> {
  const registro = await navigator.serviceWorker.getRegistration();
  return (await registro?.pushManager.getSubscription()) ?? null;
}

/** A chave VAPID vem em base64url; o navegador quer os bytes. */
function bytesDaChave(chave: string): Uint8Array<ArrayBuffer> {
  const base64 = (chave + "=".repeat((4 - (chave.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const binario = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(binario.length));
  for (let i = 0; i < binario.length; i++) {
    bytes[i] = binario.charCodeAt(i);
  }
  return bytes;
}

function enviarInscricao(inscricao: PushSubscription): Promise<void> {
  const { endpoint, keys } = inscricao.toJSON();
  return requisitar<void>("/api/v1/notificacoes/inscricoes", {
    metodo: "POST",
    corpo: { endpoint, chaves: { p256dh: keys?.p256dh, auth: keys?.auth } },
  });
}

export async function estadoNotificacoes(): Promise<EstadoNotificacoes> {
  if (!suportado() || !(await obterChavePublica())) {
    return "indisponivel";
  }
  if (Notification.permission === "denied") {
    return "bloqueado";
  }
  return Notification.permission === "granted" && (await inscricaoAtual()) ? "ativado" : "desativado";
}

/** Pede a permissão, inscreve o aparelho no serviço de push do navegador e registra a inscrição na API. */
export async function ativarNotificacoes(): Promise<EstadoNotificacoes> {
  const chave = await obterChavePublica();
  if (!suportado() || !chave) {
    return "indisponivel";
  }
  const permissao = await Notification.requestPermission();
  if (permissao !== "granted") {
    return permissao === "denied" ? "bloqueado" : "desativado";
  }
  const registro = await navigator.serviceWorker.ready;
  const opcoes = { userVisibleOnly: true, applicationServerKey: bytesDaChave(chave) };
  let inscricao = await registro.pushManager.getSubscription();
  if (!inscricao) {
    inscricao = await registro.pushManager.subscribe(opcoes);
  }
  try {
    await enviarInscricao(inscricao);
  } catch (erro) {
    // Inscrição feita com outra chave (ambiente recriado): refaz com a chave atual.
    await inscricao.unsubscribe();
    await enviarInscricao(await registro.pushManager.subscribe(opcoes)).catch(() => {
      throw erro;
    });
  }
  return "ativado";
}

/** Remove a inscrição do aparelho (Conta e Sair). Nunca lança: sair da conta não pode depender disso. */
export async function desativarNotificacoes(): Promise<void> {
  if (!suportado()) {
    return;
  }
  try {
    const inscricao = await inscricaoAtual();
    if (!inscricao) {
      return;
    }
    await requisitar<void>("/api/v1/notificacoes/inscricoes/remover", { metodo: "POST", corpo: { endpoint: inscricao.endpoint } }).catch(
      () => undefined,
    );
    await inscricao.unsubscribe();
  } catch {
    // Sem service worker ou sem conexão: a API remove a inscrição quando o serviço de push disser que ela expirou.
  }
}

/** A cada sessão: um aparelho já inscrito passa a avisar a conta que está entrando agora (RD18). */
export async function sincronizarInscricao(): Promise<void> {
  if (!suportado() || Notification.permission !== "granted") {
    return;
  }
  const inscricao = await inscricaoAtual().catch(() => null);
  if (inscricao) {
    await enviarInscricao(inscricao).catch(() => undefined);
  }
}
