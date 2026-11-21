import { enviarFormulario } from "../../../../shared/services/httpClient";
import type { ComprovanteEntregaResponse, DadosComprovante } from "../types";
import { caminhoApi } from "../../../../shared/services/caminhoApi";

/** POST /api/v1/entregas/{entregaId}/comprovante (HU06; V48: foto na porta, quem assinou e avarias) - multipart, por causa das fotos. */
export function registrarComprovante(entregaId: string, dados: DadosComprovante): Promise<ComprovanteEntregaResponse> {
  const formulario = new FormData();
  formulario.append("foto", dados.foto);
  formulario.append("identificacaoRecebedor", dados.identificacaoRecebedor);
  formulario.append("fotoPorta", dados.fotoPorta);
  formulario.append("tipoRecebedorId", dados.tipoRecebedorId);
  formulario.append("nomeRecebedor", dados.nomeRecebedor);
  dados.avarias.forEach((avaria) => formulario.append("avarias", avaria));
  if (dados.observacaoAvaria) {
    formulario.append("observacaoAvaria", dados.observacaoAvaria);
  }
  formulario.append("dataHora", dados.dataHora);
  formulario.append("idLocal", dados.idLocal);
  if (dados.posicao) {
    formulario.append("latitude", String(dados.posicao.latitude));
    formulario.append("longitude", String(dados.posicao.longitude));
  }
  if (dados.justificativaDivergencia) {
    formulario.append("justificativaDivergencia", dados.justificativaDivergencia);
  }
  return enviarFormulario<ComprovanteEntregaResponse>(caminhoApi`/api/v1/entregas/${entregaId}/comprovante`, formulario);
}
