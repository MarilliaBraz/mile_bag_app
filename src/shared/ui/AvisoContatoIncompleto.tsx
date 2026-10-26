import { Alerta } from "./Alerta";

/** Espelha com.marillia.milebag.business.bdo.model.PendenciaContatoBdo (mile_bag_api). */
export type PendenciaContatoBdo = "ENDERECO_AUSENTE" | "ENDERECO_SEM_NUMERO" | "TELEFONE_AUSENTE" | "TELEFONE_INVALIDO";

const TEXTO_PENDENCIA: Record<PendenciaContatoBdo, string> = {
  ENDERECO_AUSENTE: "Endereço de entrega não informado",
  ENDERECO_SEM_NUMERO: "Endereço sem número (use S/N se não houver)",
  TELEFONE_AUSENTE: "Telefone do passageiro não informado",
  TELEFONE_INVALIDO: "Telefone do passageiro com número de dígitos inválido (informe o DDD)",
};

/**
 * Aviso de dados de contato incompletos do BDO (RN15/RI16, HU28) - só
 * informa: nunca desabilita confirmar, assumir ou entregar.
 */
export function AvisoContatoIncompleto({
  pendencias = [],
  compacto = false,
}: {
  // Opcional: respostas guardadas antes de HU28 (cache offline) não trazem o campo.
  pendencias?: PendenciaContatoBdo[];
  compacto?: boolean;
}) {
  if (pendencias.length === 0) {
    return null;
  }
  return (
    <Alerta tipo="aviso" className={compacto ? "mt-2" : ""}>
      <strong>Confirme antes de sair:</strong>
      <ul className="lista-simples">
        {pendencias.map((pendencia) => (
          <li key={pendencia}>{TEXTO_PENDENCIA[pendencia]}</li>
        ))}
      </ul>
    </Alerta>
  );
}
