import type { Textos } from "../pt";

/** Public "Track your baggage" page (HU31), opened by the passenger. */
export const acompanhamento: Textos["acompanhamento"] = {
  titulo: "Track your baggage",
  bdo: (numero) => `BDO ${numero}`,
  carregando: "Loading tracking...",
  invalido: "Invalid tracking link",
  invalidoTexto: "Check that the whole link was copied. If the problem continues, contact the company making the delivery.",
  falha: "Could not update right now. Trying again...",
  etapas: {
    VIAGEM_INICIADA: "The driver has left for your delivery",
    A_CAMINHO: "The driver is on the way",
    CHEGADA: "The driver has arrived at the address",
    ENTREGUE: "Delivered",
    NAO_ENTREGUE: "Delivery was not possible on this attempt",
  },
  entregueTexto: "Your baggage has been delivered. Thank you!",
  naoEntregueTexto: "A new attempt will be arranged with you.",
  reagendada: (janela) => `New attempt: ${janela}.`,
  atualizadoAs: (hora) => `Position updated at ${hora}`,
  semAtualizacao: (minutos) => (minutos === 1 ? "No position update for 1 minute" : `No position update for ${minutos} minutes`),
  aguardandoPosicao: "Waiting for the driver's first position",
  motorista: "Driver",
  destino: "Delivery destination",
  mapa: "Map with the driver's position and the destination",
  saiuAs: (hora) => `Left for the delivery at ${hora}`,
};
