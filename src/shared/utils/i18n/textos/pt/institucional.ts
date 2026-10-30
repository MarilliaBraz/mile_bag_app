/** Página institucional (HU38): apresentação para empresas de entrega e companhias aéreas. Só o que o sistema faz. */
export const institucional = {
  marca: "Milebag",
  navegacao: "Navegação da página",
  entrar: "Entrar",
  pedirDemonstracao: "Pedir demonstração",
  whatsapp: "Falar no WhatsApp",
  mensagemWhatsapp: "Olá! Conheci o Milebag pela página e quero saber mais.",
  topo: {
    selo: "Bagagem extraviada, do achado à entrega",
    titulo: "Da esteira do aeroporto à porta do passageiro.",
    subtitulo:
      "O Milebag liga a companhia aérea que encontra a bagagem à empresa que a entrega: registro, encaminhamento, rota, comprovante e fechamento, com cada etapa visível para quem precisa.",
    rolar: "Role para seguir a mala",
  },
  problema: {
    titulo: "Hoje, a mala encontrada ainda viaja no improviso",
    itens: [
      {
        titulo: "Bagagem parada",
        texto: "A mala é encontrada, mas fica esperando alguém mandar os dados por e-mail ou por mensagem.",
      },
      {
        titulo: "BDO no papel e no e-mail",
        texto: "O motorista recebe o BDO por fora, digita o endereço e monta a rota por conta própria.",
      },
      {
        titulo: "Passageiro sem notícia",
        texto: "Quem espera a mala não sabe quando ela chega e liga para a companhia e para a empresa.",
      },
      {
        titulo: "Fechamento na mão",
        texto: "Quilômetros, pedágios e tentativas sem sucesso viram planilha no fim da quinzena.",
      },
    ],
  },
  jornada: {
    titulo: "A jornada da mala no Milebag",
    subtitulo: "Cada parada é uma tela real do sistema.",
    paradas: {
      registrar: {
        titulo: "A companhia registra a mala",
        texto:
          "O funcionário fotografa a etiqueta e o sistema lê o número, o voo e o passageiro. Sem etiqueta, descreve a mala e imprime um código próprio.",
        alt: "Tela de registro da bagagem encontrada pela foto da etiqueta",
      },
      encaminhar: {
        titulo: "Encaminha para a empresa parceira",
        texto: "Com o número do processo e o endereço, a bagagem vai para a empresa de entrega parceira, que recebe o BDO já confirmado.",
        alt: "Ficha da bagagem encaminhada, aguardando motorista",
      },
      motorista: {
        titulo: "O motorista recebe o aviso e assume",
        texto:
          "O celular avisa com som que chegou bagagem nova. O motorista assume a entrega, escolhe a rota e inicia a viagem, mesmo sem internet.",
        alt: "Cartão da bagagem nova no celular do motorista",
      },
      acompanhar: {
        titulo: "O passageiro acompanha no mapa",
        texto: "Um link mostra a posição do motorista em tempo real até a chegada, sem precisar de conta nem de aplicativo.",
        alt: "Página de acompanhamento da bagagem com o mapa",
      },
      comprovante: {
        titulo: "Comprovante na porta",
        texto:
          "Foto, assinatura e quem recebeu, com a posição do celular. Se não der para entregar, a ocorrência fica registrada e uma nova tentativa é combinada.",
        alt: "Tela de registro do comprovante de entrega",
      },
      fechamento: {
        titulo: "Fechamento quinzenal pronto",
        texto: "A empresa fecha a quinzena com quilômetros, pedágios e tarifas calculados, e cada motorista confere o próprio relatório.",
        alt: "Relatório quinzenal do motorista, com viagens, quilômetros e valores",
      },
    },
    entregue: "Entregue",
  },
  publicos: {
    titulo: "Feito para os dois lados da entrega",
    abas: "Escolha o seu perfil",
    empresa: {
      titulo: "Empresa de entrega",
      itens: [
        "BDO capturado pela foto ou recebido da companhia, sem digitar",
        "Rotas com alternativas, pedágios e trajeto real registrado",
        "Painel do dia, aviso de bagagem nova e alerta de emergência",
        "Comprovante, ocorrências e reagendamento com o passageiro",
        "Tarifas, fechamento quinzenal e relatórios com a sua marca",
      ],
    },
    companhia: {
      titulo: "Companhia aérea",
      itens: [
        "Registro da bagagem encontrada pela foto da etiqueta ou sem etiqueta",
        "Consulta, ficha em PDF e busca da etiqueta em todo o país",
        "Encaminhamento para a empresa parceira em poucos toques",
        "Etapa da entrega na ficha, do aguardando motorista ao entregue",
        "Passageiro avisado por e-mail e acompanhando pelo link",
      ],
    },
  },
  diferenciais: {
    titulo: "Pensado para a operação real",
    itens: [
      {
        titulo: "Funciona sem internet",
        texto: "O motorista continua trabalhando no subsolo ou na estrada; tudo sincroniza quando o sinal volta.",
      },
      {
        titulo: "Dados separados por empresa",
        texto: "Cada empresa e cada companhia vê só o que é dela, garantido no próprio banco de dados.",
      },
      { titulo: "Com a sua marca", texto: "Relatórios e fechamentos saem com o logotipo e as cores da sua empresa." },
      { titulo: "Para todo mundo", texto: "Português, espanhol e inglês, texto ampliado, alto contraste e tema escuro." },
    ],
  },
  comoComecar: {
    titulo: "Como começar",
    passos: [
      { titulo: "Peça a demonstração", texto: "Pelo formulário abaixo ou pelo WhatsApp." },
      { titulo: "Conheça na prática", texto: "Mostramos o sistema com a sua operação em mente e apresentamos os planos." },
      { titulo: "Comece a operar", texto: "Cadastramos a sua empresa e você convida a equipe." },
    ],
  },
  demonstracao: {
    titulo: "Peça uma demonstração",
    subtitulo: "Conte um pouco da sua operação. Respondemos pelo e-mail ou pelo telefone que você informar.",
    nome: "Nome",
    empresa: "Empresa",
    perfil: "Sua empresa é",
    perfilEmpresa: "Empresa de entrega",
    perfilCompanhia: "Companhia aérea",
    email: "E-mail",
    telefone: "Telefone ou WhatsApp (opcional)",
    mensagem: "Mensagem (opcional)",
    consentimento: "Autorizo o contato do Milebag sobre a demonstração.",
    enviar: "Pedir demonstração",
    enviando: "Enviando...",
    sucesso: "Pedido enviado! Em breve entramos em contato.",
    sucessoWhatsapp: "Se preferir, fale agora pelo WhatsApp.",
    limite: "Recebemos muitos pedidos deste endereço. Tente mais tarde ou fale pelo WhatsApp.",
    indisponivel: "O envio está indisponível no momento. Fale com a gente pelo WhatsApp.",
    falha: "Não foi possível enviar o pedido agora.",
    ou: "ou",
  },
  rodape: {
    lgpd: "Os dados do formulário são usados só para responder ao seu pedido de demonstração.",
    direitos: (ano: number) => `© ${ano} Milebag`,
  },
};
