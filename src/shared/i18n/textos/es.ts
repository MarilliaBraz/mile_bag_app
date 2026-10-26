import type { Textos } from "./pt";

/** Textos da interface em espanhol (mesmo formato de pt.ts). */
export const es: Textos = {
  comum: {
    precisaDeAjuda: "¿Necesita ayuda?",
    fecharAviso: "Cerrar aviso",
    carregando: "Cargando…",
  },
  idioma: {
    grupo: "Idioma",
  },
  ambiente: {
    rotulo: (ambiente) => `Entorno de ${ambiente}: datos de prueba, no lo use para entregas reales`,
    curta: (ambiente) => `${ambiente}: datos de prueba`,
    longa: (ambiente) => `Entorno de ${ambiente}: datos de prueba, no lo use para entregas reales.`,
  },
  preferencias: {
    titulo: "Texto, contraste y tema",
    diminuirTexto: "Reducir el tamaño del texto",
    aumentarTexto: "Aumentar el tamaño del texto",
    altoContraste: "Alto contraste",
    tema: "Tema",
    temas: { automatico: "Automático", claro: "Claro", escuro: "Oscuro" },
    textoEm: (fonte) => `Texto al ${fonte}%.`,
    contrasteLigado: "Alto contraste activado: el tema queda siempre claro.",
    temaAtual: (tema) => `Tema ${tema.toLowerCase()}.`,
  },
  login: {
    slogan: "El equipaje correcto, en la puerta correcta, con comprobante.",
    destaqueBdo: "BDO por la cámara o por correo electrónico",
    destaqueRota: "Ruta y peajes calculados",
    destaqueComprovante: "Comprobante incluso sin internet",
    subtitulo: "Gestión de última milla de equipajes",
    titulo: "Iniciar sesión",
    instrucao: "Use el usuario y la contraseña que le informó su empresa.",
    login: "Usuario",
    senha: "Contraseña",
    mostrar: "Mostrar",
    ocultar: "Ocultar",
    entrar: "Entrar",
    entrando: "Entrando…",
    esqueciSenha: "Olvidé mi contraseña",
    falhaAoEntrar: "No fue posible iniciar sesión. Verifique la conexión e inténtelo de nuevo.",
    sessaoExpirada: "Su sesión expiró. Inicie sesión de nuevo para continuar donde lo dejó.",
    ajudaTitulo: "¿No puede iniciar sesión?",
    ajudaTexto:
      "Verifique que el usuario esté escrito igual al que recibió y que la tecla Bloq Mayús esté desactivada. Si olvidó la contraseña, use «Olvidé mi contraseña». Si el problema continúa, hable con el administrador de su empresa.",
  },
};
