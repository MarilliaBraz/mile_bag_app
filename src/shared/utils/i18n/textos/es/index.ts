import type { Textos } from "../pt";
import { acompanhamento } from "./acompanhamento";
import { avisoBdo } from "./avisoBdo";
import { backOffice } from "./backOffice";
import { comum } from "./comum";
import { motorista } from "./motorista";

/** Textos de la interfaz en español (mismo formato de pt). */
export const es: Textos = { ...comum, motorista, backOffice, acompanhamento, avisoBdo };
