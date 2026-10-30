import type { Textos } from "../pt";

/** Airlines (HU33): registration on the platform and the airline area. */
export const companhia: Textos["companhia"] = {
  plataforma: {
    titulo: "Airlines",
    descricao:
      "Airlines whose employees register baggage found at airports. The first administrator receives an email invitation and registers the other employees.",
    cadastrar: "Register airline",
    identificador: "Access identifier",
    identificadorExemplo: "E.g.: latam",
    nome: "Name",
    codigoIata: "IATA code",
    codigoIataAjuda: "Two characters, as on the ticket: LA, G3, AD.",
    emailAdministrador: "First administrator's email",
    emailAjuda: "This email receives the invitation to set the password.",
    cadastrando: "Registering…",
    enviar: "Register airline and send invitation",
    cadastrada: (nome) => `${nome} was registered and the invitation was sent.`,
    falhaCadastrar: "Could not register the airline.",
    falhaCarregar: "Could not load the airlines.",
    carregando: "Loading airlines…",
    nenhuma: "No airlines registered",
    nenhumaDica: "Use “Register airline” to get started.",
    colunaCompanhia: "Airline",
    colunaIdentificador: "Identifier",
    colunaCadastro: "Registered on",
  },
  inicio: {
    area: "Airline",
    titulo: "Baggage registry",
    texto: "Here you will register baggage found at the airport: by photographing the tag or, without a tag, by describing the bag.",
    emBreve: "Baggage registration arrives in the next version of Milebag.",
  },
};
