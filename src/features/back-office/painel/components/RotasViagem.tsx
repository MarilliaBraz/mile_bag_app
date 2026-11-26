import { Link } from "react-router-dom";
import { Painel } from "../../../../shared/components/Pagina";
import { formatarHora, formatarNumero } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import type { RotaAtiva, SituacaoRota } from "../types";

/** Parado pode ser trânsito (amarelo); sem sinal e desvio pedem ação já (vermelho, a cor de urgência). */
const SELO: Record<SituacaoRota, string> = { NORMAL: "selo-sucesso", PARADO: "selo-aviso", SEM_SINAL: "selo-erro", DESVIO: "selo-erro" };
const ORDEM: Record<SituacaoRota, number> = { DESVIO: 0, SEM_SINAL: 1, PARADO: 2, NORMAL: 3 };

/** Fase 2: viagens em andamento que pedem acompanhamento - as longas e as com alerta, as mais graves primeiro. */
export function RotasViagem({ rotas }: { rotas: RotaAtiva[] }) {
  const t = useTextos().backOffice.painel;
  const visiveis = rotas.filter((rota) => rota.longa || rota.situacao !== "NORMAL").sort((a, b) => ORDEM[a.situacao] - ORDEM[b.situacao]);
  const km = (valor: number | null) => (valor === null ? "–" : formatarNumero(valor, 1));
  return (
    <Painel titulo={t.rotas} descricao={t.rotasDescricao} className="secao-painel">
      {visiveis.length === 0 ? (
        <p className="texto-apoio">{t.rotasVazio}</p>
      ) : (
        <div className="tabela-rolavel">
          <table className="tabela">
            <thead>
              <tr>
                <th scope="col">{t.colBdo}</th>
                <th scope="col">{t.colMotorista}</th>
                <th scope="col">{t.colTrajeto}</th>
                <th scope="col">{t.colKm}</th>
                <th scope="col">{t.colUltimaPosicao}</th>
                <th scope="col">{t.colSituacao}</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((rota) => (
                <tr key={rota.trajetoId}>
                  <th scope="row">
                    <Link to={`/admin/entregas?busca=${encodeURIComponent(rota.numero ?? "")}`}>{rota.numero ?? "–"}</Link>
                  </th>
                  <td>{rota.motorista ?? "–"}</td>
                  <td>
                    {[rota.base ?? t.semBase, rota.destino ?? "–"].join(" → ")}
                    {rota.longa && <span className="selo selo-info">{t.rotaLonga}</span>}
                    {rota.pedagio && <span className="selo">{t.comPedagio(rota.pracas)}</span>}
                    {rota.entregue && <span className="selo">{t.entregueVoltando}</span>}
                  </td>
                  <td>
                    {km(rota.kmPrevistos)} / {km(rota.kmPercorridos)}
                  </td>
                  <td>{rota.ultimaPosicao ? formatarHora(rota.ultimaPosicao) : "–"}</td>
                  <td>
                    <span className={`selo ${SELO[rota.situacao]}`}>{t.situacoesRota[rota.situacao]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Painel>
  );
}
