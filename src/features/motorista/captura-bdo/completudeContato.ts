import type { PendenciaContatoBdo } from "../../../shared/ui/AvisoContatoIncompleto";

// Mesma regra de CompletudeContatoBdo (mile_bag_api, RN15) - repetida aqui
// só para o aviso acompanhar a digitação na conferência; as duas mudam juntas.
const NUMERO_NO_ENDERECO = /\d|\bs\s*\/?\s*n\b/i;
const MINIMO_DIGITOS_TELEFONE = 10;
const MAXIMO_DIGITOS_TELEFONE = 13;

export function avaliarCompletudeContato(enderecoEntrega: string, telefonePassageiro: string): PendenciaContatoBdo[] {
  const pendencias: PendenciaContatoBdo[] = [];
  if (enderecoEntrega.trim() === "") {
    pendencias.push("ENDERECO_AUSENTE");
  } else if (!NUMERO_NO_ENDERECO.test(enderecoEntrega)) {
    pendencias.push("ENDERECO_SEM_NUMERO");
  }
  if (telefonePassageiro.trim() === "") {
    pendencias.push("TELEFONE_AUSENTE");
  } else {
    const digitos = telefonePassageiro.replace(/\D/g, "").length;
    if (digitos < MINIMO_DIGITOS_TELEFONE || digitos > MAXIMO_DIGITOS_TELEFONE) {
      pendencias.push("TELEFONE_INVALIDO");
    }
  }
  return pendencias;
}
