import type { Textos } from "../pt";

/** Aerolíneas (HU33): registro en la plataforma y área de la aerolínea. */
export const companhia: Textos["companhia"] = {
  plataforma: {
    titulo: "Aerolíneas",
    descricao:
      "Aerolíneas cuyos empleados registran el equipaje encontrado en los aeropuertos. El primer administrador recibe una invitación por correo y registra a los demás empleados.",
    cadastrar: "Registrar aerolínea",
    identificador: "Identificador de acceso",
    identificadorExemplo: "Ej.: latam",
    nome: "Nombre",
    codigoIata: "Código IATA",
    codigoIataAjuda: "Dos posiciones, como en el billete: LA, G3, AD.",
    emailAdministrador: "Correo del primer administrador",
    emailAjuda: "Ese correo recibe la invitación para definir la contraseña.",
    cadastrando: "Registrando…",
    enviar: "Registrar aerolínea y enviar invitación",
    cadastrada: (nome) => `${nome} fue registrada y se envió la invitación.`,
    falhaCadastrar: "No fue posible registrar la aerolínea.",
    falhaCarregar: "No fue posible cargar las aerolíneas.",
    carregando: "Cargando aerolíneas…",
    nenhuma: "Ninguna aerolínea registrada",
    nenhumaDica: "Use “Registrar aerolínea” para empezar.",
    colunaCompanhia: "Aerolínea",
    colunaIdentificador: "Identificador",
    colunaCadastro: "Registrada el",
  },
  inicio: {
    area: "Aerolínea",
    titulo: "Registro de equipaje",
    texto: "Aquí registrará el equipaje encontrado en el aeropuerto: fotografiando la etiqueta o, sin etiqueta, describiendo el equipaje.",
    emBreve: "El registro de equipaje llega en la próxima versión de Milebag.",
  },
};
