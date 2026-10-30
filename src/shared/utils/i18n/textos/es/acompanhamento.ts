import type { Textos } from "../pt";

/** Página pública "Siga su equipaje" (HU31), abierta por el pasajero. */
export const acompanhamento: Textos["acompanhamento"] = {
  titulo: "Siga su equipaje",
  bdo: (numero) => `BDO ${numero}`,
  carregando: "Cargando el seguimiento...",
  invalido: "Enlace de seguimiento no válido",
  invalidoTexto: "Verifique que el enlace se haya copiado completo. Si el problema continúa, hable con la empresa que realiza la entrega.",
  falha: "No fue posible actualizar ahora. Intentando de nuevo...",
  etapas: {
    VIAGEM_INICIADA: "El conductor salió para su entrega",
    A_CAMINHO: "El conductor está en camino",
    CHEGADA: "El conductor llegó a la dirección",
    ENTREGUE: "Entregado",
    NAO_ENTREGUE: "No fue posible entregar en este intento",
  },
  entregueTexto: "Su equipaje fue entregado. ¡Gracias!",
  naoEntregueTexto: "Se acordará con usted un nuevo intento.",
  reagendada: (janela) => `Nuevo intento: ${janela}.`,
  atualizadoAs: (hora) => `Posición actualizada a las ${hora}`,
  semAtualizacao: (minutos) =>
    minutos === 1 ? "Sin actualización de la posición hace 1 minuto" : `Sin actualización de la posición hace ${minutos} minutos`,
  aguardandoPosicao: "Esperando la primera posición del conductor",
  motorista: "Conductor",
  destino: "Destino de la entrega",
  mapa: "Mapa con la posición del conductor y el destino",
  saiuAs: (hora) => `Salió para la entrega a las ${hora}`,
};
