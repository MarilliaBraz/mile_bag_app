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
  { para: "/plataforma/companhias", rotulo: "companhias", icone: "predio" },
];

/** HU33: administrador da companhia aérea; HU36: consulta e busca nacional, também para o funcionário. */
export const ITENS_COMPANHIA: ItemMenu[] = [
  { para: "/companhia/funcionarios", rotulo: "funcionarios", icone: "usuarios" },
  { para: "/companhia/bagagens", rotulo: "bagagensEncontradas", icone: "mala" },
  { para: "/companhia/busca-nacional", rotulo: "buscaNacional", icone: "busca" },
];

/** O funcionário não cadastra funcionários: no lugar, volta ao registro de bagagens (o seu início). */
export const ITENS_FUNCIONARIO_COMPANHIA: ItemMenu[] = [
  { para: "/companhia/inicio", rotulo: "registrarBagagens", icone: "camera" },
  ...ITENS_COMPANHIA.slice(1),
];
