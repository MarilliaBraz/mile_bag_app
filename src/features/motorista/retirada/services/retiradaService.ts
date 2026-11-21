import { enviarFormulario } from "../../../../shared/services/httpClient";
import { caminhoApi } from "../../../../shared/services/caminhoApi";
import type { Coordenada } from "../../../../shared/components/MapaBase";

export type DadosRetirada = {
  foto: File;
  avarias: File[];
  observacaoAvaria: string | null;
  posicao: Coordenada | null;
  dataHora: string;
  /** Idempotência: o mesmo `idLocal` reenviado devolve a retirada já registrada (como no comprovante). */
  idLocal: string;
};

/** Espelha com.marillia.milebag.business.retirada.model.RetiradaBagagemResponse (V48). */
export type RetiradaResponse = {
  id: string;
  entregaId: string;
  dataHora: string;
  comLocalizacao: boolean;
  observacaoAvaria: string | null;
};

/** POST /api/v1/entregas/{entregaId}/retirada (V48) - multipart, por causa das fotos. */
export function registrarRetirada(entregaId: string, dados: DadosRetirada): Promise<RetiradaResponse> {
  const formulario = new FormData();
  formulario.append("foto", dados.foto);
  dados.avarias.forEach((avaria) => formulario.append("avarias", avaria));
  if (dados.observacaoAvaria) {
    formulario.append("observacaoAvaria", dados.observacaoAvaria);
  }
  if (dados.posicao) {
    formulario.append("latitude", String(dados.posicao.latitude));
    formulario.append("longitude", String(dados.posicao.longitude));
  }
  formulario.append("dataHora", dados.dataHora);
  formulario.append("idLocal", dados.idLocal);
  return enviarFormulario<RetiradaResponse>(caminhoApi`/api/v1/entregas/${entregaId}/retirada`, formulario);
}
