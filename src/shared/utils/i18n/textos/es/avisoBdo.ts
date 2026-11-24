import type { Textos } from "../pt";

/** Aviso de equipaje nuevo (HU32): en la app abierta y en el control de la Cuenta. */
export const avisoBdo: Textos["avisoBdo"] = {
  titulo: "Nuevo equipaje para retirar en el aeropuerto",
  varias: (quantidade) => `${quantidade} equipajes nuevos para retirar en el aeropuerto`,
  bdo: (numero) => `BDO ${numero}`,
  ver: "Ver",
  fechar: "Cerrar",
  /** V47: a empresa cancelou uma entrega que estava com o motorista. */
  cancelada: "Entrega cancelada por la empresa",
  /** V59: la empresa corrigió los datos del pasajero de una entrega del conductor. */
  dadosAlterados: "Datos de la entrega cambiados por la empresa",
  notificacoes: {
    titulo: "Avisos de equipaje nuevo con la app cerrada",
    explicacao: "Con la app abierta, el aviso sonoro ya funciona. Actívelo para recibir el aviso también con la app cerrada.",
    ativar: "Activar avisos",
    desativar: "Desactivar avisos",
    aguarde: "Espere…",
    estados: {
      ativado: "Activados en este dispositivo",
      desativado: "Desactivados",
      bloqueado: "Bloqueados en el navegador",
      indisponivel: "No disponibles en este dispositivo",
    },
    bloqueadoAjuda:
      "Permita las notificaciones de Milebag en la configuración del navegador (candado junto a la dirección) e intente de nuevo.",
    indisponivelAjuda:
      "Este navegador no recibe notificaciones con la app cerrada. En el iPhone, instale Milebag en la pantalla de inicio (Compartir > Añadir a pantalla de inicio).",
    falha: "No fue posible cambiar los avisos ahora. Intente de nuevo.",
  },
};
