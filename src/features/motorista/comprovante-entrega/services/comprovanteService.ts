import { enviarFormulario } from "../../../../shared/services/httpClient";
import type { ComprovanteEntregaResponse, DadosComprovante } from "../types";

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
