/**
 * Espelha BagagemEncontradaResponse (specs/HU34-bagagem-com-etiqueta/contracts/bagagens-api.md,
 * specs/HU35-bagagem-sem-etiqueta/contracts/bagagens-sem-etiqueta-api.md e
 * specs/HU36-consulta-bagagens/contracts/consulta-bagagens-api.md).
 */
export type OrigemLeitura = "CODIGO_BARRAS" | "TEXTO" | "NENHUMA";
export type OrigemLocalizacao = "FOTO" | "APARELHO" | "NENHUMA";

export type DadosEtiqueta = {
  numeroEtiqueta?: string;
  companhia?: string;
  destino?: string;
  voo?: string;
  nomePassageiro?: string;
};

/** HU35: descrição da bagagem sem etiqueta (as opções, na ordem da tela, ficam em utils/opcoesDescricao). */
export type CorBagagem =
  "PRETA" | "CINZA" | "BRANCA" | "BEGE" | "MARROM" | "VERMELHA" | "LARANJA" | "AMARELA" | "VERDE" | "AZUL" | "ROXA" | "ROSA";
export type TipoVolume = "MALA_RIGIDA" | "MALA_TECIDO" | "MOCHILA" | "BOLSA" | "CAIXA" | "INSTRUMENTO" | "CARRINHO_BEBE" | "OUTRO";
export type TamanhoBagagem = "P" | "M" | "G";
export type SinalParticular = "FITA" | "ADESIVO" | "CADEADO" | "AVARIA";

export type DescricaoBagagem = {
  tipoVolume: TipoVolume;
  tamanho: TamanhoBagagem;
  cor: CorBagagem;
  sinais: SinalParticular[];
  marca?: string;
  observacoes?: string;
  codigoSid: string;
};

export type TipoBagagemEncontrada = "COM_ETIQUETA" | "SEM_ETIQUETA";
export type SituacaoBagagemEncontrada = "RASCUNHO" | "REGISTRADA";

export type BagagemEncontrada = {
  id: string;
  tipo: TipoBagagemEncontrada;
  situacao: SituacaoBagagemEncontrada;
  lido: DadosEtiqueta & { origemLeitura: OrigemLeitura; cor?: CorBagagem };
  etiqueta?: DadosEtiqueta;
  descricao?: DescricaoBagagem;
  localizacao: { latitude?: number; longitude?: number; origem: OrigemLocalizacao };
  aeroporto?: { codigo: string; nome: string; cidade: string; uf: string; distanciaMetros?: number; distante?: boolean };
  registradoPor?: string;
  registradaEm?: string;
  criadoEm: string;
  fotoUrl: string;
  qrUrl?: string;
};

export type Aeroporto = { codigo: string; nome: string; cidade: string; uf: string };

export type ConfirmacaoEtiqueta = Required<Pick<DadosEtiqueta, "numeroEtiqueta">> &
  Omit<DadosEtiqueta, "numeroEtiqueta"> & { aeroportoCodigo: string };

export type Descrever = Omit<DescricaoBagagem, "codigoSid"> & { aeroportoCodigo: string };

/** HU36: filtros da consulta, como ficam na URL (vazio não filtra). */
export type FiltrosConsulta = Partial<Record<"aeroporto" | "de" | "ate" | "tipo" | "tipoVolume" | "cor" | "situacao" | "texto", string>>;

export type PaginaBagagens = { itens: BagagemEncontrada[]; total: number; pagina: number; tamanho: number };

/** HU36 (RD22): o que a busca nacional mostra; `id` só nos registros da própria companhia. */
export type BagagemNacional = {
  companhia: { nome?: string; codigoIata?: string };
  aeroporto: Aeroporto;
  registradaEm: string;
  latitude?: number;
  longitude?: number;
  daMinhaCompanhia: boolean;
  id?: string;
};
