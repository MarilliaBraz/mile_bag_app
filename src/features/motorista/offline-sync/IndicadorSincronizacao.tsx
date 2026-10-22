import { Link } from "react-router-dom";
import { Alerta } from "../../../shared/ui/Alerta";
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

  return (
    <Alerta tipo={online ? "info" : "aviso"} className="nao-imprimir">
      <strong>{online ? "Conectado" : "Sem conexão"}</strong>
      {!online && ": o que você registrar fica salvo no aparelho."}
      {pendentes > 0 && (
        <>
          {" "}
          {pendentes} registro(s) aguardando envio.
        </>
      )}{" "}
      <Link to="/motorista/registros">Ver registros</Link>
    </Alerta>
  );
}
