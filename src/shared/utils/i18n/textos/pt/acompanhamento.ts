/** Página pública "Acompanhe sua bagagem" (HU31), aberta pelo passageiro. */
export const acompanhamento = {
  titulo: "Acompanhe sua bagagem",
  bdo: (numero: string) => `BDO ${numero}`,
  carregando: "Carregando o acompanhamento...",
  invalido: "Link de acompanhamento inválido",
  invalidoTexto: "Confira se o link foi copiado inteiro. Se o problema continuar, fale com a empresa que está fazendo a entrega.",
  falha: "Não foi possível atualizar agora. Tentando de novo...",
  etapas: {
    VIAGEM_INICIADA: "O motorista saiu para a sua entrega",
    A_CAMINHO: "O motorista está a caminho",
    CHEGADA: "O motorista chegou ao endereço",
    ENTREGUE: "Entregue",
    NAO_ENTREGUE: "Não foi possível entregar nesta tentativa",
  },
  entregueTexto: "Sua bagagem foi entregue. Obrigado!",
  naoEntregueTexto: "Uma nova tentativa será combinada com você.",
  reagendada: (janela: string) => `Nova tentativa: ${janela}.`,
  atualizadoAs: (hora: string) => `Posição atualizada às ${hora}`,
  semAtualizacao: (minutos: number) =>
    minutos === 1 ? "Sem atualização da posição há 1 minuto" : `Sem atualização da posição há ${minutos} minutos`,
  aguardandoPosicao: "Aguardando a primeira posição do motorista",
  motorista: "Motorista",
  destino: "Destino da entrega",
  mapa: "Mapa com a posição do motorista e o destino",
  saiuAs: (hora: string) => `Saiu para a entrega às ${hora}`,
};
