/*
 * Web Push do aviso de bagagem nova (HU32, RF25) - importado pelo service worker gerado pelo vite-plugin-pwa
 * (workbox.importScripts em vite.config.ts). Com o app visível, só avisa a janela, que toca o som e mostra o aviso;
 * senão, mostra a notificação do sistema, com o som e a vibração do aparelho.
 */
self.addEventListener("push", (evento) => {
  let dados = {};
  try {
    dados = evento.data ? evento.data.json() : {};
  } catch {
    // Conteúdo fora do formato: a notificação sai com o texto padrão.
  }
  evento.waitUntil(
    (async () => {
      const janelas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      janelas.forEach((janela) => janela.postMessage({ tipo: "bdo-novo" }));
      if (janelas.some((janela) => janela.visibilityState === "visible")) {
        return;
      }
      await self.registration.showNotification(dados.titulo || "Nova bagagem para retirar no aeroporto", {
        body: dados.corpo || "",
        icon: "/icone-192.png",
        badge: "/icone-192.png",
        tag: "bdo-novo",
        renotify: true,
        vibrate: [200, 100, 200],
        data: { url: dados.url || "/motorista" },
      });
    })(),
  );
});

// Tocar na notificação abre (ou traz para a frente) o app no painel.
self.addEventListener("notificationclick", (evento) => {
  evento.notification.close();
  const url = (evento.notification.data && evento.notification.data.url) || "/motorista";
  evento.waitUntil(
    (async () => {
      const janelas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const aberta = janelas[0];
      if (aberta) {
        await aberta.focus();
        await aberta.navigate(url).catch(() => undefined);
        return;
      }
      await self.clients.openWindow(url);
    })(),
  );
});
