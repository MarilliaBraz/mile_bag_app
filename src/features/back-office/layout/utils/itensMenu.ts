import type { ItemMenu } from "../types";

export const ITENS_TENANT: ItemMenu[] = [
  { para: "/admin/motoristas", rotulo: "motoristas", icone: "usuarios" },
  { para: "/admin/emergencias", rotulo: "emergencias", icone: "alerta" },
  { para: "/admin/tarifas", rotulo: "tarifas", icone: "moeda" },
  { para: "/admin/pedagios", rotulo: "pedagios", icone: "pedagio" },
  { para: "/admin/fechamentos", rotulo: "fechamentos", icone: "calendario" },
  { para: "/admin/configuracoes", rotulo: "configuracoes", icone: "engrenagem" },
  { para: "/admin/identidade-visual", rotulo: "identidadeVisual", icone: "imagem" },
];

export const ITENS_PLATAFORMA: ItemMenu[] = [
  { para: "/plataforma/empresas", rotulo: "empresas", icone: "predio" },
  { para: "/plataforma/planos", rotulo: "planos", icone: "lista" },
];
