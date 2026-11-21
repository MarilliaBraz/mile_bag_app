import { Link } from "react-router-dom";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Alerta } from "../../../../shared/components/Alerta";
import { Icone } from "../../../../shared/components/Icone";
import type { RotaSelecionada } from "../types";
import { formatarDistancia, formatarDuracao } from "../utils/formatarRota";

/**
 * Início da viagem (HU04, FR-001), encadeado à seleção de rota de HU03: o
 * cálculo da rota escolhida vira o {@code CalculoRota} inicial do trajeto,
 * junto com o checkpoint de partida. V48: só depois da retirada da bagagem (foto); antes dela, leva à retirada.
 */
export function IniciarViagem({
  entregaId,
  selecao,
  aoIniciar,
  ocupado = false,
  retiradaFeita,
}: {
  entregaId: string;
  selecao: RotaSelecionada;
  aoIniciar: () => void;
  ocupado?: boolean;
  /** `false`: a retirada ainda não foi registrada; `null`: não deu para saber (sem conexão) - o servidor decide. */
  retiradaFeita: boolean | null;
}) {
  const t = useTextos().motorista.rota;
  return (
    <section className="cartao mt-4">
      <div className="texto-apoio">{t.rotaEscolhida(selecao.tipoSelecao === "PROPRIA" ? t.tipoPropria : t.tipoSugerida)}</div>
      <p className="destaque">
        {formatarDuracao(selecao.rotaEscolhida.duracaoSegundos)} · {formatarDistancia(selecao.rotaEscolhida.distanciaMetros)}
      </p>
      {selecao.justificativa && <p className="texto-apoio">{t.justificativa(selecao.justificativa)}</p>}

      {retiradaFeita === null && (
        <Alerta tipo="aviso">
          <p>{t.retiradaNaoConfirmada}</p>
          <Link to={`/motorista/entregas/${entregaId}/retirada`} viewTransition className="botao secundario bloco">
            <Icone nome="camera" /> {t.registrarRetirada}
          </Link>
        </Alerta>
      )}
      {retiradaFeita === false ? (
        <Alerta tipo="aviso">
          <p>{t.retiradaPendente}</p>
          <Link to={`/motorista/entregas/${entregaId}/retirada`} viewTransition className="botao grande bloco">
            <Icone nome="camera" /> {t.registrarRetirada}
          </Link>
        </Alerta>
      ) : (
        <button type="button" className="grande bloco" onClick={aoIniciar} disabled={ocupado}>
          <Icone nome="carro" /> {ocupado ? t.iniciando : t.iniciarViagem}
        </button>
      )}
    </section>
  );
}
