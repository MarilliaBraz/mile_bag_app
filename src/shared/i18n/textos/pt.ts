/**
 * Textos da interface em português, a referência dos outros idiomas.
 * Texto com valor variável é função: es.ts e en.ts recebem os mesmos
 * parâmetros e o TypeScript confere que nenhum ficou de fora.
 */
export const pt = {
  comum: {
    precisaDeAjuda: "Precisa de ajuda?",
    fecharAviso: "Fechar aviso",
    carregando: "Carregando…",
  },
  idioma: {
    grupo: "Idioma",
  },
  ambiente: {
    rotulo: (ambiente: string) => `Ambiente de ${ambiente}: dados de teste, não use para entregas reais`,
    curta: (ambiente: string) => `${ambiente}: dados de teste`,
    longa: (ambiente: string) => `Ambiente de ${ambiente}: dados de teste, não use para entregas reais.`,
  },
  preferencias: {
    titulo: "Texto, contraste e tema",
    diminuirTexto: "Diminuir o tamanho do texto",
    aumentarTexto: "Aumentar o tamanho do texto",
    altoContraste: "Alto contraste",
    tema: "Tema",
    temas: { automatico: "Automático", claro: "Claro", escuro: "Escuro" },
    textoEm: (fonte: number) => `Texto em ${fonte}%.`,
    contrasteLigado: "Alto contraste ligado: o tema fica sempre claro.",
    temaAtual: (tema: string) => `Tema ${tema.toLowerCase()}.`,
  },
  login: {
    slogan: "A bagagem certa, na porta certa, com comprovante.",
    destaqueBdo: "BDO pela câmera ou pelo e-mail",
    destaqueRota: "Rota e pedágios calculados",
    destaqueComprovante: "Comprovante mesmo sem internet",
    subtitulo: "Gestão de última milha de bagagens",
    titulo: "Entrar",
    instrucao: "Use o login e a senha que a sua empresa informou.",
    login: "Login",
    senha: "Senha",
    mostrar: "Mostrar",
    ocultar: "Ocultar",
    entrar: "Entrar",
    entrando: "Entrando…",
    esqueciSenha: "Esqueci minha senha",
    falhaAoEntrar: "Não foi possível entrar. Verifique a conexão e tente de novo.",
    sessaoExpirada: "Sua sessão expirou. Entre de novo para continuar de onde parou.",
    ajudaTitulo: "Não consegue entrar?",
    ajudaTexto:
      "Confira se o login está escrito igual ao que recebeu e se a tecla Caps Lock está desligada. Se esqueceu a senha, use “Esqueci minha senha”. Se o problema continuar, fale com o administrador da sua empresa.",
  },
};

/** Formato que todo idioma precisa ter: o mesmo de pt, com qualquer texto no lugar de cada frase. */
type Formato<T> = {
  [Chave in keyof T]: T[Chave] extends string ? string : T[Chave] extends (...args: never[]) => string ? T[Chave] : Formato<T[Chave]>;
};

export type Textos = Formato<typeof pt>;
