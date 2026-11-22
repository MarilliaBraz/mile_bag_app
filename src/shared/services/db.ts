import Dexie, { type EntityTable } from "dexie";
import type { RegistroPendente } from "../types/offlineSync";

/** Item 9: um ponto do caminho da viagem, guardado até a API confirmar. */
export type PontoCaminho = {
  idLocal: string;
  entregaId: string;
  latitude: number;
  longitude: number;
  precisaoMetros: number | null;
  dataHora: string;
  /** A API respondeu "pendente" (viagem ainda não sincronizada): só volta a ser enviado depois disto (epoch ms). */
  adiadoAte?: number;
};

const bancoLocal = new Dexie("milebag") as Dexie & {
  registrosPendentes: EntityTable<RegistroPendente, "idLocal">;
  pontosCaminho: EntityTable<PontoCaminho, "idLocal">;
};

bancoLocal.version(1).stores({
  registrosPendentes: "idLocal, sequenciaLocal, status",
});
bancoLocal.version(2).stores({
  registrosPendentes: "idLocal, sequenciaLocal, status",
  pontosCaminho: "idLocal, dataHora",
});

export { bancoLocal };
