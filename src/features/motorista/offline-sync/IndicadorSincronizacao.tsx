import { Link } from "react-router-dom";
import { Alerta } from "../../../shared/ui/Alerta";
import { Icone } from "../../../shared/ui/Icone";

type EstadoSincronizacao = { online: boolean; pendentes: number };

/**
 * Selo compacto do estado da conexão, sempre visível na barra superior do
 * motorista (diretrizes de IHC, seção 3: o estado da conexão aparece sem
 * interação em qualquer tela operacional). Ícone + texto, a cor só reforça.
 * Leva à tela de registros do aparelho, onde cada item mostra sua situação.
 */
export function StatusConexao({ online, pendentes }: EstadoSincronizacao) {
  const classe = !online ? " offline" : pendentes > 0 ? " pendente" : "";
  const texto = !online ? "Sem conexão" : pendentes > 0 ? `${pendentes} a enviar` : "Conectado";
  return (
    <Link to="/motorista/registros" className={`status-conexao nao-imprimir${classe}`} aria-label={`${texto}. Ver registros do aparelho`}>
      <Icone nome={online ? (pendentes > 0 ? "sincronizar" : "conexao") : "semConexao"} />
      <span aria-hidden="true">{texto}</span>
    </Link>
  );
}

/**
 * Aviso de operação offline e de registros pendentes (HU08,
 * FR-002/FR-003), logo abaixo da barra superior: sem ele, o motorista
 * não teria como distinguir um registro já confirmado pelo servidor de um
 * que ainda está só no aparelho.
 */
export function IndicadorSincronizacao({ online, pendentes }: EstadoSincronizacao) {
  if (online && pendentes === 0) {
    return null;
  }

  return (
    <Alerta tipo={online ? "info" : "aviso"} className="nao-imprimir">
      <strong>{online ? "Enviando registros" : "Sem conexão"}</strong>
      {!online && ": o que você registrar fica salvo no aparelho e é enviado sozinho quando a internet voltar."}
      {pendentes > 0 && <> {pendentes === 1 ? "1 registro aguardando envio." : `${pendentes} registros aguardando envio.`}</>}{" "}
      <Link to="/motorista/registros">Ver registros</Link>
    </Alerta>
  );
}
