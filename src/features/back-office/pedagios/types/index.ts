/** Espelha PracaPedagioResponse; `valorVigente` é nulo quando só há valores com vigência futura. */
export type PracaPedagio = {
  id: string;
  nome: string;
  valorVigente: number | null;
  vigenteDesde: string | null;
  /** Localização (HU24): sem ela a praça não é detectada nas rotas. */
  latitude: number | null;
  longitude: number | null;
};

/** Espelha ValorPedagioResponse. */
export type ValorPedagio = { valor: number; vigenteDesde: string };
