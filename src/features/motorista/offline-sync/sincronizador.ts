import { requisitar } from "../../../shared/api/httpClient";
import { bancoLocal } from "./db";
import { listarParaEnviar } from "./fila";

type ResultadoSincronizacao = "ACEITO" | "DUPLICADO" | "ERRO" | "NAO_ENCONTRADO";

type ResultadoEvento = {
  idLocal: string;
  resultado: ResultadoSincronizacao;
  idServidor?: string;
  motivo?: string;
};

type SincronizarLoteResponse = {
  resultados: ResultadoEvento[];
};

let sincronizando = false;

/**
 * Envia a fila local ao servidor em um único lote, na ordem de criação no
 * dispositivo (HU08, FR-004/FR-005), e aplica o resultado de cada evento:
 *
 * <ul>
 *   <li>`ACEITO`/`DUPLICADO` → sincronizado. `DUPLICADO` é o reenvio de um
 *       registro que o servidor já tinha (FR-006) - resultado de sucesso,
 *       não de erro.</li>
 *   <li>`ERRO`/`NAO_ENCONTRADO` → fica na fila com o motivo do servidor e a
 *       contagem de tentativas (FR-007), para nova tentativa.</li>
 * </ul>
 *
 * <p>Uma falha de rede no meio do envio não muda nada localmente: tudo
 * continua pendente e é reenviado na próxima tentativa.</p>
 */
export async function sincronizar(): Promise<{ enviados: number; comErro: number }> {
  // Guarda contra execuções concorrentes (evento `online` + intervalo
  // periódico podem disparar juntos e reenviar o mesmo lote).
  if (sincronizando) {
    return { enviados: 0, comErro: 0 };
  }
  sincronizando = true;

  try {
    const registros = await listarParaEnviar();
    if (registros.length === 0) {
      return { enviados: 0, comErro: 0 };
    }

    const resposta = await requisitar<SincronizarLoteResponse>("/api/v1/sync/eventos", {
      metodo: "POST",
      corpo: {
        eventos: registros.map((registro) => ({
          idLocal: registro.idLocal,
          sequenciaLocal: registro.sequenciaLocal,
          tipoEvento: registro.tipoEvento,
          timestampCriacaoLocal: registro.timestampCriacaoLocal,
          payload: registro.payload,
        })),
      },
    });

    let enviados = 0;
    let comErro = 0;
    for (const resultado of resposta.resultados) {
      if (resultado.resultado === "ACEITO" || resultado.resultado === "DUPLICADO") {
        await bancoLocal.registrosPendentes.update(resultado.idLocal, { status: "SINCRONIZADO", motivo: null });
        enviados += 1;
      } else {
        const registro = await bancoLocal.registrosPendentes.get(resultado.idLocal);
        await bancoLocal.registrosPendentes.update(resultado.idLocal, {
          status: "ERRO",
          tentativas: (registro?.tentativas ?? 0) + 1,
          motivo: resultado.motivo ?? "O servidor recusou este registro.",
        });
        comErro += 1;
      }
    }
    return { enviados, comErro };
  } finally {
    sincronizando = false;
  }
}
