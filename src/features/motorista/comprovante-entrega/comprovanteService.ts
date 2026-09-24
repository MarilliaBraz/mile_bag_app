import { enviarFormulario } from "../../../shared/api/httpClient";
import type { Coordenada } from "../../../shared/mapa/MapaBase";

/** Espelha com.marillia.milebag.business.comprovante.model.ComprovanteEntregaResponse. */
export type ComprovanteEntregaResponse = {
  id: string;
  entregaId: string;
  dataHora: string;
  entregaStatus: string;
};

export type DadosComprovante = {
  foto: File;
  identificacaoRecebedor: string;
  dataHora: string;
  posicao: Coordenada | null;
  /** Idempotência: o mesmo `idLocal` reenviado devolve o comprovante já criado, em vez de duplicar (HU06/HU08). */
  idLocal: string;
  justificativaDivergencia?: string | null;
};

/** POST /api/v1/entregas/{entregaId}/comprovante (HU06) - multipart, porque carrega a foto do documento assinado. */
export function registrarComprovante(entregaId: string, dados: DadosComprovante): Promise<ComprovanteEntregaResponse> {
  const formulario = new FormData();
  formulario.append("foto", dados.foto);
  formulario.append("identificacaoRecebedor", dados.identificacaoRecebedor);
  formulario.append("dataHora", dados.dataHora);
  formulario.append("idLocal", dados.idLocal);
  if (dados.posicao) {
    formulario.append("latitude", String(dados.posicao.latitude));
    formulario.append("longitude", String(dados.posicao.longitude));
  }
  if (dados.justificativaDivergencia) {
    formulario.append("justificativaDivergencia", dados.justificativaDivergencia);
  }
  return enviarFormulario<ComprovanteEntregaResponse>(`/api/v1/entregas/${entregaId}/comprovante`, formulario);
}
