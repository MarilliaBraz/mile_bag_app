import { useState } from "react";
import { Link } from "react-router-dom";
import { formatarData, formatarDataHora, mensagemDeErro } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Alerta } from "../../../../shared/components/Alerta";
import { Icone } from "../../../../shared/components/Icone";
import { buscarMinhasEntregasPorNumero, type EntregaEncontrada } from "../services/painelService";
import { TOM_STATUS_ENTREGA } from "../utils/statusEntrega";

/**
 * Item 4c: o motorista acha pelo número do BDO uma entrega dele de qualquer época (em andamento, concluída ou paga)
 * e abre o detalhe. Precisa de internet: a busca é no servidor.
 */
export function BuscaBdoMotorista() {
  const textos = useTextos();
  const t = textos.motorista.painel.busca;
  const [numero, setNumero] = useState("");
  const [achadas, setAchadas] = useState<EntregaEncontrada[] | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function buscar() {
    setErro(null);
    if (!navigator.onLine) {
      setErro(t.semConexao);
      return;
    }
    setBuscando(true);
    try {
      setAchadas(await buscarMinhasEntregasPorNumero(numero.trim()));
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falha));
    } finally {
      setBuscando(false);
    }
  }

  return (
    <section className="pilha" aria-labelledby="busca-bdo-titulo">
      <form
        className="pilha"
        role="search"
        onSubmit={(evento) => {
          evento.preventDefault();
          void buscar();
        }}
      >
        <label id="busca-bdo-titulo" htmlFor="busca-bdo-motorista">
          {t.rotulo}
        </label>
        <div className="form-linha">
          <input
            id="busca-bdo-motorista"
            type="search"
            required
            value={numero}
            onChange={(evento) => {
              setNumero(evento.target.value);
              setAchadas(null);
            }}
            placeholder={t.exemplo}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" className="secundario" disabled={buscando || !numero.trim()}>
            <Icone nome="busca" /> {t.buscar}
          </button>
        </div>
      </form>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {achadas && achadas.length === 0 && <p className="texto-apoio">{t.nenhuma}</p>}
      {achadas && achadas.length > 0 && (
        <ul className="lista">
          {achadas.map((achada) => (
            <li key={achada.entregaId}>
              <Link to={`/motorista/entregas/${achada.entregaId}`} viewTransition className="cartao-link">
                <strong className="codigo">{achada.bdoNumero ?? "—"}</strong>
                <span className={`selo selo-${TOM_STATUS_ENTREGA[achada.status]}`}>{textos.motorista.status[achada.status]}</span>
                {achada.pagoEm && <span className="selo selo-sucesso">{t.pagaEm(formatarData(achada.pagoEm))}</span>}
                <span className="texto-apoio">
                  {achada.passageiroNome ?? "—"} · {formatarDataHora(achada.atualizadoEm)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
