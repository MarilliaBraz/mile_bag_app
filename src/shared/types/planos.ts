/** Espelha PlanoAssinaturaResponse. */
export type Plano = {
  id: string;
  nome: string;
  limiteMotoristasAtivos: number;
  limiteVolumeMensalBdos: number;
  criadoEm: string;
};

/** Espelha PlanoAssinaturaListItemResponse - só a listagem traz a contagem de empresas. */
export type PlanoComUso = { plano: Plano; tenantsAssociados: number };

/** Espelha TrocarPlanoResponse. */
export type ResultadoTrocaPlano = { planoVigente: Plano; usoExcedeuLimiteNaTroca: boolean };
