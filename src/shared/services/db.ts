import Dexie, { type EntityTable } from "dexie";
import type { RegistroPendente } from "../types/offlineSync";

const bancoLocal = new Dexie("milebag") as Dexie & {
  registrosPendentes: EntityTable<RegistroPendente, "idLocal">;
};

bancoLocal.version(1).stores({
  registrosPendentes: "idLocal, sequenciaLocal, status",
});

export { bancoLocal };
