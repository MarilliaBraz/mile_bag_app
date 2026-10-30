import type { Textos } from "../pt";
import { acompanhamento } from "./acompanhamento";
import { backOffice } from "./backOffice";
import { comum } from "./comum";
import { motorista } from "./motorista";

/** Interface texts in English (same shape as pt). */
export const en: Textos = { ...comum, motorista, backOffice, acompanhamento };
