/** Companhias aéreas (HU33): cadastro na plataforma e área da companhia. */
export const companhia = {
  plataforma: {
    titulo: "Companhias aéreas",
    descricao:
      "Companhias cujos funcionários registram as bagagens encontradas nos aeroportos. O primeiro administrador recebe um convite por e-mail e cadastra os demais funcionários.",
    cadastrar: "Cadastrar companhia",
    identificador: "Identificador de acesso",
    identificadorExemplo: "Ex.: latam",
    nome: "Nome",
    codigoIata: "Código IATA",
    codigoIataAjuda: "Duas posições, como no bilhete: LA, G3, AD.",
    emailAdministrador: "E-mail do primeiro administrador",
    emailAjuda: "Esse e-mail recebe o convite para definir a senha.",
    cadastrando: "Cadastrando…",
    enviar: "Cadastrar companhia e enviar convite",
    cadastrada: (nome: string) => `${nome} foi cadastrada e o convite foi enviado.`,
    falhaCadastrar: "Não foi possível cadastrar a companhia.",
    falhaCarregar: "Não foi possível carregar as companhias.",
    carregando: "Carregando companhias…",
    nenhuma: "Nenhuma companhia aérea cadastrada",
    nenhumaDica: "Use “Cadastrar companhia” para começar.",
    colunaCompanhia: "Companhia",
    colunaIdentificador: "Identificador",
    colunaCadastro: "Cadastrada em",
  },
  inicio: {
    area: "Companhia aérea",
    titulo: "Registro de bagagens",
    texto: "Aqui você vai registrar as bagagens encontradas no aeroporto: fotografando a etiqueta ou, sem etiqueta, descrevendo a bagagem.",
    emBreve: "O registro de bagagens chega na próxima versão do Milebag.",
  },
};
