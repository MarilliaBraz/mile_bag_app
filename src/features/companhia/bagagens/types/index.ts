/** Espelha BagagemEncontradaResponse (specs/HU34-bagagem-com-etiqueta/contracts/bagagens-api.md). */
export type OrigemLeitura = "CODIGO_BARRAS" | "TEXTO" | "NENHUMA";
export type OrigemLocalizacao = "FOTO" | "APARELHO" | "NENHUMA";

export type DadosEtiqueta = {
  numeroEtiqueta?: string;
  companhia?: string;
  destino?: string;
  voo?: string;
  nomePassageiro?: string;
};

export type BagagemEncontrada = {
  id: string;
  tipo: "COM_ETIQUETA" | "SEM_ETIQUETA";
  situacao: "RASCUNHO" | "REGISTRADA";
  lido: DadosEtiqueta & { origemLeitura: OrigemLeitura };
  etiqueta?: DadosEtiqueta;
  localizacao: { latitude?: number; longitude?: number; origem: OrigemLocalizacao };
  aeroporto?: { codigo: string; nome: string; cidade: string; uf: string; distanciaMetros?: number; distante?: boolean };
  registradoPor?: string;
  registradaEm?: string;
  criadoEm: string;
  fotoUrl: string;
};

export type Aeroporto = { codigo: string; nome: string; cidade: string; uf: string };

export type ConfirmacaoEtiqueta = Required<Pick<DadosEtiqueta, "numeroEtiqueta">> &
  Omit<DadosEtiqueta, "numeroEtiqueta"> & { aeroportoCodigo: string };
