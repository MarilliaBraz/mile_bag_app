import { enviarFormulario, requisitar } from "../../../../shared/services/httpClient";
import { caminhoApi } from "../../../../shared/services/caminhoApi";

/** Espelha com.marillia.milebag.business.entrega.model.EntregaCorrigivelResponse (V51). */
export type EntregaCorrigivel = {
  entregaId: string;
  bdoNumero: string | null;
  passageiroNome: string | null;
  corrigivelAte: string;
};

type Motivo = { motivoId: string; complemento: string | null };
type Avarias = { corrigirAvarias: boolean; avarias: File[]; observacaoAvaria: string | null };

function anexarComuns(formulario: FormData, motivo: Motivo, avarias: Avarias) {
  formulario.append("motivoId", motivo.motivoId);
  if (motivo.complemento) {
    formulario.append("complemento", motivo.complemento);
  }
  formulario.append("corrigirAvarias", String(avarias.corrigirAvarias));
  if (avarias.corrigirAvarias) {
    avarias.avarias.forEach((foto) => formulario.append("avarias", foto));
    if (avarias.observacaoAvaria) {
      formulario.append("observacaoAvaria", avarias.observacaoAvaria);
    }
  }
}

/** POST /api/v1/entregas/{id}/retirada/correcao (V51) - antes de iniciar a viagem; precisa de internet. */
export function corrigirRetirada(entregaId: string, dados: Motivo & Avarias & { foto: File | null }): Promise<unknown> {
  const formulario = new FormData();
  if (dados.foto) {
    formulario.append("foto", dados.foto);
  }
  anexarComuns(formulario, dados, dados);
  return enviarFormulario<unknown>(caminhoApi`/api/v1/entregas/${entregaId}/retirada/correcao`, formulario);
}

/** POST /api/v1/entregas/{id}/comprovante/correcao (V51) - até 24 h depois de finalizar; precisa de internet. */
export function corrigirEntrega(
  entregaId: string,
  dados: Motivo &
    Avarias & { fotoPorta: File | null; fotoDocumento: File | null; tipoRecebedorId: string | null; nomeRecebedor: string | null },
): Promise<unknown> {
  const formulario = new FormData();
  if (dados.fotoPorta) {
    formulario.append("fotoPorta", dados.fotoPorta);
  }
  if (dados.fotoDocumento) {
    formulario.append("fotoDocumento", dados.fotoDocumento);
  }
  if (dados.tipoRecebedorId && dados.nomeRecebedor) {
    formulario.append("tipoRecebedorId", dados.tipoRecebedorId);
    formulario.append("nomeRecebedor", dados.nomeRecebedor);
  }
  anexarComuns(formulario, dados, dados);
  return enviarFormulario<unknown>(caminhoApi`/api/v1/entregas/${entregaId}/comprovante/correcao`, formulario);
}

/** GET /api/v1/motorista/entregas-corrigiveis (V51) - finalizadas nas últimas 24 h. */
export const listarCorrigiveis = () => requisitar<EntregaCorrigivel[]>("/api/v1/motorista/entregas-corrigiveis");
