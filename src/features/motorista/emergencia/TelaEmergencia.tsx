import { useEffect, useState } from "react";
import { ApiError } from "../../../shared/api/ApiError";
import { acionarAlerta, cancelarAlerta, consultarMeuAlertaAberto, type AlertaEmergencia } from "../../../shared/api/emergenciaApi";
import { registrarFalha } from "../../../shared/diagnostico/registroFalhas";
import { obterPosicaoAtual } from "../../../shared/geo/posicaoAtual";
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
  if (excecao instanceof ApiError && (excecao.status === 401 || excecao.status === 403)) {
    return `Sua sessão expirou e o alerta não chegou à empresa. Se precisar de ajuda agora, ligue ${NUMERO_POLICIA}. Depois, entre de novo no aplicativo para avisar a empresa.`;
  }
  return `O alerta não chegou à empresa. Se precisar de ajuda agora, ligue ${NUMERO_POLICIA}. Você também pode tocar em “Enviar alerta de emergência” para tentar de novo.`;
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
      setErro(excecao instanceof ApiError ? excecao.message : "Não foi possível cancelar o alerta. Tente de novo.");
    }
  }

  return (
    <TelaMotorista titulo="Emergência" voltarPara="/motorista" rotuloVoltar="Voltar para o painel">
      <a href={`tel:${NUMERO_POLICIA}`} className="botao grande bloco perigo">
        <Icone nome="telefone" /> Ligar {NUMERO_POLICIA} (Polícia)
      </a>

      {erro && <Alerta tipo="erro">{erro}</Alerta>}

      {!online && (
        <Alerta tipo="aviso">
          Sem conexão: o alerta para a empresa não pode ser enviado agora. Se precisar de ajuda, ligue {NUMERO_POLICIA}.
        </Alerta>
      )}

      {online && carregando && <Carregando texto="Verificando alertas…" />}

      {online && !carregando && !alerta && (
        <section className="cartao mt-4">
          <h2 className="mt-0">Avisar a empresa</h2>
          <p className="texto-apoio">
            Os administradores da empresa recebem na hora o seu nome, o horário e a sua localização (se o GPS responder).
          </p>
          <button type="button" className="grande bloco perigo" onClick={enviar} disabled={enviando}>
            <Icone nome="alerta" /> {enviando ? "Enviando alerta…" : "Enviar alerta de emergência"}
          </button>
        </section>
      )}

      {alerta && (
        <section className="cartao mt-4" aria-live="assertive">
          <Alerta tipo="sucesso">
            <strong>
              Alerta enviado às {new Date(alerta.dataHora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.
            </strong>{" "}
            A empresa foi avisada{alerta.latitude === null ? " (sem localização: o GPS não respondeu)" : " com a sua localização"}.
          </Alerta>
          <p className="texto-apoio">Fique em local seguro. A empresa vai entrar em contato.</p>
          <button type="button" className="secundario bloco" onClick={cancelar}>
            Cancelar alerta (acionei por engano)
          </button>
        </section>
      )}
    </TelaMotorista>
  );
}
