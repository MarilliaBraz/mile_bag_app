/** Aviso de bagagem nova (HU32): no app aberto e no controle da Conta. */
export const avisoBdo = {
  titulo: "Nova bagagem para retirar no aeroporto",
  varias: (quantidade: number) => `${quantidade} bagagens novas para retirar no aeroporto`,
  bdo: (numero: string) => `BDO ${numero}`,
  ver: "Ver",
  fechar: "Fechar",
  notificacoes: {
    titulo: "Avisos de bagagem nova com o app fechado",
    explicacao: "Com o app aberto, o aviso sonoro já funciona. Ative para ser avisado também com o app fechado.",
    ativar: "Ativar avisos",
    desativar: "Desativar avisos",
    aguarde: "Aguarde…",
    estados: {
      ativado: "Ativados neste aparelho",
      desativado: "Desativados",
      bloqueado: "Bloqueados no navegador",
      indisponivel: "Indisponíveis neste aparelho",
    },
    bloqueadoAjuda: "Libere as notificações do Milebag nas configurações do navegador (cadeado ao lado do endereço) e tente de novo.",
    indisponivelAjuda:
      "Este navegador não recebe notificações com o app fechado. No iPhone, instale o Milebag na tela inicial (Compartilhar > Adicionar à Tela de Início).",
    falha: "Não foi possível mudar os avisos agora. Tente de novo.",
  },
};
