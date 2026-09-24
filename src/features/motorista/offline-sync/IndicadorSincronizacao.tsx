import { useSincronizacaoAutomatica } from "./useSincronizacaoAutomatica";

/**
 * Indicador de operação offline e de registros pendentes (HU08,
 * FR-002/FR-003). Fica no topo das telas do motorista: sem ele, o motorista
 * não teria como distinguir um registro já confirmado pelo servidor de um
 * que ainda está só no aparelho.
 */
export function IndicadorSincronizacao({ aoSincronizar }: { aoSincronizar?: () => void }) {
  const { online, pendentes } = useSincronizacaoAutomatica(aoSincronizar);

  if (online && pendentes === 0) {
    return null;
  }

  const cor = online ? "var(--aviso)" : "var(--erro)";

  return (
    <p
      role="status"
      style={{
        margin: "0 0 1rem",
        padding: "0.5rem 0.75rem",
        borderRadius: 6,
        border: `1px solid ${cor}`,
        color: cor,
        fontSize: "0.9rem",
      }}
    >
      {online ? "📶 Conectado" : "📴 Sem conexão — os registros ficam salvos no aparelho"}
      {pendentes > 0 && ` · ${pendentes} registro(s) aguardando sincronização`}
    </p>
  );
}
