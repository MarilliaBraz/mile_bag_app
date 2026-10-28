import type { Textos } from "../pt";

/** New baggage alert (HU32): in the open app and in the Account control. */
export const avisoBdo: Textos["avisoBdo"] = {
  titulo: "New baggage to pick up at the airport",
  varias: (quantidade) => `${quantidade} new bags to pick up at the airport`,
  bdo: (numero) => `BDO ${numero}`,
  ver: "View",
  fechar: "Close",
  notificacoes: {
    titulo: "New baggage alerts with the app closed",
    explicacao: "With the app open, the sound alert already works. Turn this on to be alerted with the app closed too.",
    ativar: "Turn on alerts",
    desativar: "Turn off alerts",
    aguarde: "Please wait…",
    estados: {
      ativado: "On for this device",
      desativado: "Off",
      bloqueado: "Blocked in the browser",
      indisponivel: "Not available on this device",
    },
    bloqueadoAjuda: "Allow Milebag notifications in the browser settings (padlock next to the address) and try again.",
    indisponivelAjuda:
      "This browser does not receive notifications with the app closed. On iPhone, install Milebag on the home screen (Share > Add to Home Screen).",
    falha: "Could not change the alerts right now. Try again.",
  },
};
