import { Link } from "react-router-dom";
import { useTextos } from "../utils/i18n/idioma";
import { Alerta } from "./Alerta";
import { Icone } from "./Icone";

type EstadoSincronizacao = { online: boolean; pendentes: number };

/**
 * Selo compacto do estado da conexão, sempre visível na barra superior do
 * motorista (diretrizes de IHC, seção 3: o estado da conexão aparece sem
 * interação em qualquer tela operacional). Ícone + texto, a cor só reforça.
 * Leva à tela de registros do aparelho, onde cada item mostra sua situação.
 */
export function StatusConexao({ online, pendentes }: EstadoSincronizacao) {
  const t = useTextos().motorista.conexao;
  const classe = !online ? " offline" : pendentes > 0 ? " pendente" : "";
  const texto = !online ? t.semConexao : pendentes > 0 ? t.aEnviar(pendentes) : t.conectado;
  return (
    <Link to="/motorista/registros" className={`status-conexao nao-imprimir${classe}`} aria-label={t.verRegistros(texto)}>
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
  const t = useTextos().motorista.conexao;
  if (online && pendentes === 0) {
    return null;
  }

  return (
    <Alerta tipo={online ? "info" : "aviso"} className="nao-imprimir">
      <strong>{online ? t.enviando : t.semConexao}</strong>
      {!online && t.salvoNoAparelho}
      {pendentes > 0 && <> {t.aguardando(pendentes)}</>} <Link to="/motorista/registros">{t.linkRegistros}</Link>
    </Alerta>
  );
}
