import { useEffect, useState } from "react";
import { ApiError } from "../../../shared/api/ApiError";
import { acionarAlerta, cancelarAlerta, consultarMeuAlertaAberto, type AlertaEmergencia } from "../../../shared/api/emergenciaApi";
import { registrarFalha } from "../../../shared/diagnostico/registroFalhas";
import { formatarHora } from "../../../shared/format/formatar";
import { obterPosicaoAtual } from "../../../shared/geo/posicaoAtual";
import { obterTextos, useTextos } from "../../../shared/i18n/idioma";
import { Alerta, Carregando } from "../../../shared/ui/Alerta";
import { Icone } from "../../../shared/ui/Icone";
import { TelaMotorista } from "../layout/TelaMotorista";
import { useConectividade } from "../offline-sync/useConectividade";

const NUMERO_POLICIA = "190";

/**
 * Mensagem de falha do envio do alerta. Nunca repassa o texto do servidor:
 * numa emergência o motorista precisa saber o que fazer agora, não o motivo
 * técnico (que vai para os registros do aparelho via registrarFalha).
 */
function mensagemFalhaEnvio(excecao: unknown): string {
  const t = obterTextos().motorista.emergencia;
  if (excecao instanceof ApiError && (excecao.status === 401 || excecao.status === 403)) {
    return t.sessaoExpirou(NUMERO_POLICIA);
  }
  return t.naoChegou(NUMERO_POLICIA);
}

/**
 * Alerta de emergência (HU30, RI18): abrir esta tela + "Enviar alerta" são os
 * dois toques. Não substitui o 190, que fica sempre à vista - e é a única
 * saída sem conexão, porque um alerta guardado para depois chegaria tarde.
 */
export function TelaEmergencia() {
  const online = useConectividade();
  const [alerta, setAlerta] = useState<AlertaEmergencia | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const textos = useTextos();
  const t = textos.motorista.emergencia;

  useEffect(() => {
    // Offline o "carregando" nem aparece (só é exibido com conexão); ao voltar a rede, consulta.
    if (!online) {
      return;
    }
    consultarMeuAlertaAberto()
      .then((aberto) => setAlerta(aberto ?? null))
      .catch(() => undefined)
      .finally(() => setCarregando(false));
  }, [online]);

  async function enviar() {
    setErro(null);
    setEnviando(true);
    try {
      // Tempo curto: numa emergência o alerta sem posição é melhor que um alerta atrasado.
      const posicao = await obterPosicaoAtual(5_000);
      setAlerta(await acionarAlerta(posicao));
    } catch (excecao) {
      registrarFalha(excecao);
      setErro(mensagemFalhaEnvio(excecao));
    } finally {
      setEnviando(false);
    }
  }

  async function cancelar() {
    if (!alerta) {
      return;
    }
    setErro(null);
    try {
      await cancelarAlerta(alerta.id);
      setAlerta(null);
    } catch (excecao) {
      setErro(excecao instanceof ApiError ? excecao.message : t.falhaCancelar);
    }
  }

  return (
    <TelaMotorista titulo={t.titulo} voltarPara="/motorista" rotuloVoltar={textos.motorista.geral.voltarPainel}>
      <a href={`tel:${NUMERO_POLICIA}`} className="botao grande bloco perigo">
        <Icone nome="telefone" /> {t.ligar(NUMERO_POLICIA)}
      </a>

      {erro && <Alerta tipo="erro">{erro}</Alerta>}

      {!online && <Alerta tipo="aviso">{t.semConexao(NUMERO_POLICIA)}</Alerta>}

      {online && carregando && <Carregando texto={t.verificando} />}

      {online && !carregando && !alerta && (
        <section className="cartao mt-4">
          <h2 className="mt-0">{t.avisarEmpresa}</h2>
          <p className="texto-apoio">{t.explicacao}</p>
          <button type="button" className="grande bloco perigo" onClick={enviar} disabled={enviando}>
            <Icone nome="alerta" /> {enviando ? t.enviandoAlerta : t.enviarAlerta}
          </button>
        </section>
      )}

      {alerta && (
        <section className="cartao mt-4" aria-live="assertive">
          <Alerta tipo="sucesso">
            <strong>{t.enviadoAs(formatarHora(alerta.dataHora))}</strong> {alerta.latitude === null ? t.avisadaSemLocal : t.avisadaComLocal}
          </Alerta>
          <p className="texto-apoio">{t.fiqueSeguro}</p>
          <button type="button" className="secundario bloco" onClick={cancelar}>
            {t.cancelar}
          </button>
        </section>
      )}
    </TelaMotorista>
  );
}
