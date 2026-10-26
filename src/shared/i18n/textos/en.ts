import type { Textos } from "./pt";

/** Textos da interface em inglês (mesmo formato de pt.ts). */
export const en: Textos = {
  comum: {
    precisaDeAjuda: "Need help?",
    fecharAviso: "Close notice",
    carregando: "Loading…",
  },
  idioma: {
    grupo: "Language",
  },
  ambiente: {
    rotulo: (ambiente) => `${ambiente} environment: test data, do not use for real deliveries`,
    curta: (ambiente) => `${ambiente}: test data`,
    longa: (ambiente) => `${ambiente} environment: test data, do not use for real deliveries.`,
  },
  preferencias: {
    titulo: "Text, contrast and theme",
    diminuirTexto: "Decrease text size",
    aumentarTexto: "Increase text size",
    altoContraste: "High contrast",
    tema: "Theme",
    temas: { automatico: "Automatic", claro: "Light", escuro: "Dark" },
    textoEm: (fonte) => `Text at ${fonte}%.`,
    contrasteLigado: "High contrast on: the theme always stays light.",
    temaAtual: (tema) => `${tema} theme.`,
  },
  login: {
    slogan: "The right bag, at the right door, with proof of delivery.",
    destaqueBdo: "BDO by camera or by email",
    destaqueRota: "Route and tolls calculated",
    destaqueComprovante: "Proof of delivery even offline",
    subtitulo: "Last-mile baggage delivery management",
    titulo: "Sign in",
    instrucao: "Use the username and password your company gave you.",
    login: "Username",
    senha: "Password",
    mostrar: "Show",
    ocultar: "Hide",
    entrar: "Sign in",
    entrando: "Signing in…",
    esqueciSenha: "Forgot my password",
    falhaAoEntrar: "Could not sign in. Check your connection and try again.",
    sessaoExpirada: "Your session has expired. Sign in again to pick up where you left off.",
    ajudaTitulo: "Can't sign in?",
    ajudaTexto:
      "Check that the username is typed exactly as you received it and that Caps Lock is off. If you forgot your password, use “Forgot my password”. If the problem continues, contact your company's administrator.",
  },
};
