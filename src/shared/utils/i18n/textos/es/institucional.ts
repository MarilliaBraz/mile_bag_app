/** Página institucional (HU38) en español. */
export const institucional = {
  marca: "Milebag",
  navegacao: "Navegación de la página",
  entrar: "Ingresar",
  pedirDemonstracao: "Solicitar demostración",
  whatsapp: "Hablar por WhatsApp",
  mensagemWhatsapp: "¡Hola! Conocí Milebag por la página y quiero saber más.",
  topo: {
    selo: "Equipaje extraviado, del hallazgo a la entrega",
    titulo: "De la cinta del aeropuerto a la puerta del pasajero.",
    subtitulo:
      "Milebag conecta a la aerolínea que encuentra el equipaje con la empresa que lo entrega: registro, derivación, ruta, comprobante y cierre, con cada etapa visible para quien la necesita.",
    rolar: "Desplácese para seguir la maleta",
  },
  problema: {
    titulo: "Hoy, la maleta encontrada todavía viaja improvisando",
    itens: [
      { titulo: "Equipaje detenido", texto: "La maleta aparece, pero espera a que alguien envíe los datos por correo o por mensaje." },
      {
        titulo: "BDO en papel y por correo",
        texto: "El conductor recibe el BDO por fuera, escribe la dirección y arma la ruta por su cuenta.",
      },
      { titulo: "Pasajero sin noticias", texto: "Quien espera la maleta no sabe cuándo llega y llama a la aerolínea y a la empresa." },
      { titulo: "Cierre a mano", texto: "Kilómetros, peajes e intentos fallidos terminan en una planilla al final de la quincena." },
    ],
  },
  jornada: {
    titulo: "El viaje de la maleta en Milebag",
    subtitulo: "Cada parada es una pantalla real del sistema.",
    paradas: {
      registrar: {
        titulo: "La aerolínea registra la maleta",
        texto:
          "El empleado fotografía la etiqueta y el sistema lee el número, el vuelo y el pasajero. Sin etiqueta, describe la maleta e imprime un código propio.",
        alt: "Pantalla de registro del equipaje encontrado por la foto de la etiqueta",
      },
      encaminhar: {
        titulo: "La deriva a la empresa asociada",
        texto:
          "Con el número de expediente y la dirección, el equipaje va a la empresa de entrega asociada, que recibe el BDO ya confirmado.",
        alt: "Ficha del equipaje derivado, esperando conductor",
      },
      motorista: {
        titulo: "El conductor recibe el aviso y la asume",
        texto:
          "El celular avisa con sonido que llegó equipaje nuevo. El conductor asume la entrega, elige la ruta e inicia el viaje, incluso sin internet.",
        alt: "Tarjeta del equipaje nuevo en el celular del conductor",
      },
      acompanhar: {
        titulo: "El pasajero sigue en el mapa",
        texto: "Un enlace muestra la posición del conductor en tiempo real hasta la llegada, sin cuenta ni aplicación.",
        alt: "Página de seguimiento del equipaje con el mapa",
      },
      comprovante: {
        titulo: "Comprobante en la puerta",
        texto:
          "Foto, firma y quién recibió, con la posición del celular. Si no se puede entregar, la incidencia queda registrada y se acuerda un nuevo intento.",
        alt: "Pantalla de registro del comprobante de entrega",
      },
      fechamento: {
        titulo: "Cierre quincenal listo",
        texto: "La empresa cierra la quincena con kilómetros, peajes y tarifas calculados, y cada conductor revisa su propio informe.",
        alt: "Informe quincenal del conductor, con viajes, kilómetros y valores",
      },
    },
    entregue: "Entregado",
  },
  publicos: {
    titulo: "Hecho para los dos lados de la entrega",
    abas: "Elija su perfil",
    empresa: {
      titulo: "Empresa de entrega",
      itens: [
        "BDO capturado por foto o recibido de la aerolínea, sin escribir",
        "Rutas con alternativas, peajes y trayecto real registrado",
        "Panel del día, aviso de equipaje nuevo y alerta de emergencia",
        "Comprobante, incidencias y reprogramación con el pasajero",
        "Tarifas, cierre quincenal e informes con su marca",
      ],
    },
    companhia: {
      titulo: "Aerolínea",
      itens: [
        "Registro del equipaje encontrado por la foto de la etiqueta o sin etiqueta",
        "Consulta, ficha en PDF y búsqueda de la etiqueta en todo el país",
        "Derivación a la empresa asociada en pocos toques",
        "Etapa de la entrega en la ficha, de esperando conductor a entregado",
        "Pasajero avisado por correo y siguiendo por el enlace",
      ],
    },
  },
  diferenciais: {
    titulo: "Pensado para la operación real",
    itens: [
      {
        titulo: "Funciona sin internet",
        texto: "El conductor sigue trabajando en el subsuelo o en la ruta; todo se sincroniza cuando vuelve la señal.",
      },
      {
        titulo: "Datos separados por empresa",
        texto: "Cada empresa y cada aerolínea ve solo lo suyo, garantizado en la propia base de datos.",
      },
      { titulo: "Con su marca", texto: "Informes y cierres salen con el logotipo y los colores de su empresa." },
      { titulo: "Para todos", texto: "Portugués, español e inglés, texto ampliado, alto contraste y tema oscuro." },
    ],
  },
  comoComecar: {
    titulo: "Cómo empezar",
    passos: [
      { titulo: "Solicite la demostración", texto: "Por el formulario de abajo o por WhatsApp." },
      { titulo: "Conózcalo en la práctica", texto: "Le mostramos el sistema pensando en su operación y presentamos los planes." },
      { titulo: "Empiece a operar", texto: "Registramos su empresa y usted invita al equipo." },
    ],
  },
  demonstracao: {
    titulo: "Solicite una demostración",
    subtitulo: "Cuéntenos un poco de su operación. Respondemos por el correo o el teléfono que nos indique.",
    nome: "Nombre",
    empresa: "Empresa",
    perfil: "Su empresa es",
    perfilEmpresa: "Empresa de entrega",
    perfilCompanhia: "Aerolínea",
    email: "Correo electrónico",
    telefone: "Teléfono o WhatsApp (opcional)",
    mensagem: "Mensaje (opcional)",
    consentimento: "Autorizo que Milebag me contacte sobre la demostración.",
    enviar: "Solicitar demostración",
    enviando: "Enviando...",
    sucesso: "¡Solicitud enviada! Pronto nos pondremos en contacto.",
    sucessoWhatsapp: "Si prefiere, hable ahora por WhatsApp.",
    limite: "Recibimos muchas solicitudes desde esta dirección. Intente más tarde o hable por WhatsApp.",
    indisponivel: "El envío no está disponible en este momento. Hable con nosotros por WhatsApp.",
    falha: "No fue posible enviar la solicitud ahora.",
    ou: "o",
  },
  rodape: {
    lgpd: "Los datos del formulario se usan solo para responder a su solicitud de demostración.",
    direitos: (ano: number) => `© ${ano} Milebag`,
  },
};
