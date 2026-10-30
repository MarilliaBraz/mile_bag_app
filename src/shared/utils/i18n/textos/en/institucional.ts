/** Institutional page (HU38) in English. */
export const institucional = {
  marca: "Milebag",
  navegacao: "Page navigation",
  entrar: "Sign in",
  pedirDemonstracao: "Request a demo",
  whatsapp: "Chat on WhatsApp",
  mensagemWhatsapp: "Hi! I found Milebag through the website and would like to know more.",
  topo: {
    selo: "Mishandled baggage, from found to delivered",
    titulo: "From the airport carousel to the passenger's door.",
    subtitulo:
      "Milebag connects the airline that finds the bag to the company that delivers it: registration, handover, route, proof of delivery and settlement, with every step visible to those who need it.",
    rolar: "Scroll to follow the bag",
  },
  problema: {
    titulo: "Today, a found bag still travels on improvisation",
    itens: [
      { titulo: "Bags left waiting", texto: "The bag is found, but it waits for someone to send the details by e-mail or message." },
      { titulo: "Paper and e-mail BDOs", texto: "The driver gets the BDO on the side, types the address and plans the route alone." },
      {
        titulo: "Passengers in the dark",
        texto: "Whoever waits for the bag has no idea when it arrives and calls the airline and the company.",
      },
      { titulo: "Manual settlement", texto: "Kilometres, tolls and failed attempts end up in a spreadsheet at the end of the fortnight." },
    ],
  },
  jornada: {
    titulo: "The bag's journey in Milebag",
    subtitulo: "Each stop is a real screen of the system.",
    paradas: {
      registrar: {
        titulo: "The airline registers the bag",
        texto:
          "The agent takes a photo of the tag and the system reads the number, the flight and the passenger. Without a tag, they describe the bag and print a code of its own.",
        alt: "Screen for registering a found bag from a photo of its tag",
      },
      encaminhar: {
        titulo: "It hands the bag over to a partner",
        texto:
          "With the file reference and the address, the bag goes to the partner delivery company, which receives the BDO already confirmed.",
        alt: "Record of the handed-over bag, waiting for a driver",
      },
      motorista: {
        titulo: "The driver gets the alert and takes it",
        texto:
          "The phone alerts with a sound that a new bag has arrived. The driver takes the delivery, picks the route and starts the trip, even offline.",
        alt: "New bag card on the driver's phone",
      },
      acompanhar: {
        titulo: "The passenger follows on the map",
        texto: "A link shows the driver's position in real time until arrival, with no account and no app.",
        alt: "Bag tracking page with the map",
      },
      comprovante: {
        titulo: "Proof at the door",
        texto:
          "Photo, signature and who received it, with the phone's position. If it can't be delivered, the issue is recorded and a new attempt is arranged.",
        alt: "Proof of delivery screen",
      },
      fechamento: {
        titulo: "Fortnightly settlement ready",
        texto: "The company closes the fortnight with kilometres, tolls and rates calculated, and each driver checks their own report.",
        alt: "Company's fortnightly settlement screen",
      },
    },
    entregue: "Delivered",
  },
  publicos: {
    titulo: "Built for both sides of the delivery",
    abas: "Choose your profile",
    empresa: {
      titulo: "Delivery company",
      itens: [
        "BDO captured by photo or received from the airline, no typing",
        "Routes with alternatives, tolls and the real trip recorded",
        "Daily dashboard, new bag alert and emergency alert",
        "Proof of delivery, issues and rescheduling with the passenger",
        "Rates, fortnightly settlement and reports with your brand",
      ],
    },
    companhia: {
      titulo: "Airline",
      itens: [
        "Found bags registered from a photo of the tag or without a tag",
        "Search, PDF record and nationwide tag lookup",
        "Handover to the partner company in a few taps",
        "Delivery step on the record, from waiting for a driver to delivered",
        "Passenger notified by e-mail and following through the link",
      ],
    },
  },
  diferenciais: {
    titulo: "Designed for real operations",
    itens: [
      { titulo: "Works offline", texto: "Drivers keep working in basements or on the road; everything syncs when the signal returns." },
      { titulo: "Data kept apart", texto: "Each company and each airline sees only its own data, enforced in the database itself." },
      { titulo: "With your brand", texto: "Reports and settlements carry your company's logo and colours." },
      { titulo: "For everyone", texto: "Portuguese, Spanish and English, larger text, high contrast and dark theme." },
    ],
  },
  comoComecar: {
    titulo: "How to get started",
    passos: [
      { titulo: "Request a demo", texto: "Using the form below or on WhatsApp." },
      { titulo: "See it in practice", texto: "We show the system with your operation in mind and present the plans." },
      { titulo: "Start operating", texto: "We register your company and you invite your team." },
    ],
  },
  demonstracao: {
    titulo: "Request a demo",
    subtitulo: "Tell us a little about your operation. We reply by the e-mail or phone you provide.",
    nome: "Name",
    empresa: "Company",
    perfil: "Your company is",
    perfilEmpresa: "Delivery company",
    perfilCompanhia: "Airline",
    email: "E-mail",
    telefone: "Phone or WhatsApp (optional)",
    mensagem: "Message (optional)",
    consentimento: "I agree to be contacted by Milebag about the demo.",
    enviar: "Request a demo",
    enviando: "Sending...",
    sucesso: "Request sent! We'll be in touch soon.",
    sucessoWhatsapp: "If you prefer, chat with us now on WhatsApp.",
    limite: "We received too many requests from this address. Try again later or chat on WhatsApp.",
    indisponivel: "Sending is unavailable right now. Please reach us on WhatsApp.",
    falha: "We couldn't send your request right now.",
    ou: "or",
  },
  rodape: {
    lgpd: "Form data is used only to reply to your demo request.",
    direitos: (ano: number) => `© ${ano} Milebag`,
  },
};
