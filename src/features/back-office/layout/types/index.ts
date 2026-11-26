import type { ChaveMenu } from "../../../../shared/utils/i18n/idioma";
import type { NomeIcone } from "../../../../shared/components/Icone";

import type { Pendencias } from "../hooks/usePendencias";

/** Item do menu lateral: guarda a chave do texto, e o rótulo sai no idioma da vez. `contador` liga o balão de pendências. */
export type ItemMenu = { para: string; rotulo: ChaveMenu; icone: NomeIcone; contador?: keyof Pendencias };
