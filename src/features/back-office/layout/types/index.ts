import type { ChaveMenu } from "../../../../shared/utils/i18n/idioma";
import type { NomeIcone } from "../../../../shared/components/Icone";

/** Item do menu lateral: guarda a chave do texto, e o rótulo sai no idioma da vez. */
export type ItemMenu = { para: string; rotulo: ChaveMenu; icone: NomeIcone };
