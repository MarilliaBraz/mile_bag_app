import type { Textos } from "../pt";
import { acompanhamento } from "./acompanhamento";
import { avisoBdo } from "./avisoBdo";
import { companhia } from "./companhia";
import { institucional } from "./institucional";
import { backOffice } from "./backOffice";
import { comum } from "./comum";
import { motorista } from "./motorista";

/** Interface texts in English (same shape as pt). */
export const en: Textos = { ...comum, motorista, backOffice, acompanhamento, avisoBdo, companhia, institucional };
