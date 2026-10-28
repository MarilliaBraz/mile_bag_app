import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { Alerta, Carregando } from "../../../shared/components/Alerta";
import { MapaBase, type MarcadorMapa } from "../../../shared/components/MapaBase";
import { SeletorIdioma } from "../../../shared/components/SeletorIdioma";
import { useIntervaloEmPrimeiroPlano } from "../../../shared/hooks/useIntervaloEmPrimeiroPlano";
import { ApiError } from "../../../shared/services/ApiError";
import { formatarHora, formatarJanela } from "../../../shared/utils/formatar";
import { useTextos } from "../../../shared/utils/i18n/idioma";
import { consultarAcompanhamento } from "../services/acompanhamentoService";
import type { Acompanhamento } from "../types";

const INTERVALO_MS = 15_000;
// Acima disso a posição deixa de ser "atual" para o passageiro (RI19).
const POSICAO_DESATUALIZADA_MS = 2 * 60_000;

/**
 * "Acompanhe sua bagagem" (HU31, RI19): página aberta pelo passageiro, sem login, pelo link recebido por e-mail ou
 * Telegram. Atualiza sozinha a cada 15 s enquanto a tentativa está em andamento e a página está visível; entregue ou
 * não entregue, para de consultar e não mostra mais a posição do motorista (RN16).
 */
export function TelaAcompanhamento() {
  const { codigo = "" } = useParams();
  const t = useTextos().acompanhamento;
  const [dados, setDados] = useState<Acompanhamento | null>(null);
  // Hora da última resposta: a idade da posição é calculada contra ela, não durante a renderização.
  const [consultadoEm, setConsultadoEm] = useState(0);
  const [invalido, setInvalido] = useState(false);
  const [falhou, setFalhou] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setDados(await consultarAcompanhamento(codigo));
      setConsultadoEm(Date.now());
      setFalhou(false);
    } catch (excecao) {
      if (excecao instanceof ApiError && excecao.status === 404) {
        setInvalido(true);
      } else {
        setFalhou(true);
      }
    }
  }, [codigo]);

  const encerrada = dados?.etapa === "ENTREGUE" || dados?.etapa === "NAO_ENTREGUE";
  useIntervaloEmPrimeiroPlano(carregar, INTERVALO_MS, !invalido && !encerrada);

  return (
    <div className="tela-entrada tela-acompanhamento">
      <main className="pilha">
        <div className="entrada-idioma">
          <SeletorIdioma />
        </div>
        {invalido ? (
          <Alerta tipo="erro">
            <strong>{t.invalido}</strong> {t.invalidoTexto}
          </Alerta>
        ) : !dados ? (
          falhou ? (
            <Alerta tipo="aviso">{t.falha}</Alerta>
          ) : (
            <Carregando texto={t.carregando} />
          )
        ) : (
          <Conteudo dados={dados} consultadoEm={consultadoEm} falhou={falhou} />
        )}
      </main>
    </div>
  );
}

function Conteudo({ dados, consultadoEm, falhou }: { dados: Acompanhamento; consultadoEm: number; falhou: boolean }) {
  const t = useTextos().acompanhamento;
  const { empresa, etapa, posicao, destino } = dados;
  const encerrada = etapa === "ENTREGUE" || etapa === "NAO_ENTREGUE";
  const marcadores: MarcadorMapa[] = [
    ...(posicao ? [{ posicao, rotulo: t.motorista }] : []),
    ...(destino ? [{ posicao: destino, rotulo: t.destino }] : []),
  ];
  const minutosSemAtualizar = posicao ? Math.floor((consultadoEm - Date.parse(posicao.registradaEm)) / 60_000) : 0;

  return (
    <>
      <header>
        {empresa.logotipoUrl && (
          <img className="acompanhamento-logo" src={`${import.meta.env.VITE_API_BASE_URL}${empresa.logotipoUrl}`} alt={empresa.nome} />
        )}
        <p className="marca">{empresa.nome}</p>
        <h1>{t.titulo}</h1>
        {dados.bdoNumero && <p className="texto-apoio">{t.bdo(dados.bdoNumero)}</p>}
      </header>

      <section className="cartao pilha" aria-live="polite">
        <p className="cartao-titulo">
          <span className={`selo ${etapa === "ENTREGUE" ? "selo-sucesso" : etapa === "NAO_ENTREGUE" ? "selo-aviso" : "selo-info"}`}>
            {t.etapas[etapa]}
          </span>
        </p>
        {etapa === "ENTREGUE" && <p>{t.entregueTexto}</p>}
        {etapa === "NAO_ENTREGUE" && (
          <p>{dados.janelaReagendamento ? t.reagendada(formatarJanela(dados.janelaReagendamento)) : t.naoEntregueTexto}</p>
        )}
        {!encerrada && (
          <>
            <p className="texto-apoio">{t.saiuAs(formatarHora(dados.iniciadaEm))}</p>
            {!posicao ? (
              <p className="texto-apoio">{t.aguardandoPosicao}</p>
            ) : consultadoEm - Date.parse(posicao.registradaEm) > POSICAO_DESATUALIZADA_MS ? (
              <Alerta tipo="aviso">{t.semAtualizacao(minutosSemAtualizar)}</Alerta>
            ) : (
              <p className="texto-apoio">{t.atualizadoAs(formatarHora(posicao.registradaEm))}</p>
            )}
          </>
        )}
        {falhou && <Alerta tipo="aviso">{t.falha}</Alerta>}
      </section>

      {!encerrada && marcadores.length > 0 && (
        // Remonta quando a primeira posição chega, para o mapa enquadrar motorista e destino juntos.
        <MapaBase
          key={posicao ? "com-posicao" : "sem-posicao"}
          centro={marcadores[0].posicao}
          marcadores={marcadores}
          descricao={t.mapa}
          altura={320}
        />
      )}
    </>
  );
}
