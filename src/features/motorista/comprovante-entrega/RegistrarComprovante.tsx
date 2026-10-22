import { Icone } from "../../../shared/ui/Icone";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../../../shared/api/ApiError";
import { obterPosicaoDetalhada, ORIENTACAO_FALHA_POSICAO, type MotivoFalhaPosicao } from "../../../shared/geo/posicaoAtual";
import type { Coordenada } from "../../../shared/mapa/MapaBase";
import { arquivoParaBase64, executarOuEnfileirar } from "../offline-sync/fila";
import { TelaMotorista } from "../layout/TelaMotorista";
import { JustificativaDivergencia } from "../rota/components/JustificativaDivergencia";
import { Ajuda } from "../../../shared/ui/Ajuda";
import { Alerta, Carregando } from "../../../shared/ui/Alerta";
import { ConfirmarAcao } from "../../../shared/ui/ConfirmarAcao";
import { registrarComprovante } from "./comprovanteService";

const TIPO_DIVERGENCIA = "divergencia-trajeto-sem-justificativa";

/**
 * Registro do comprovante de entrega (HU06) - foto do documento assinado,
 * identificação de quem recebeu, e data/hora e coordenadas capturadas
 * automaticamente. Registrar o comprovante encerra a entrega e consolida o
 * trajeto (HU04) na mesma transação do back-end.
 *
 * <p>Por isso este formulário também trata a recusa por divergência de
 * quilometragem (RN14): o back-end responde `422` com o tipo {@code
 * divergencia-trajeto-sem-justificativa}, e o reenvio acontece com a
 * justificativa preenchida, sem perder foto nem campos já preenchidos.</p>
 */
export function RegistrarComprovante() {
  const { entregaId } = useParams<{ entregaId: string }>();
  const navegar = useNavigate();

  const [foto, setFoto] = useState<File | null>(null);
  const [identificacaoRecebedor, setIdentificacaoRecebedor] = useState("");
  const [posicao, setPosicao] = useState<Coordenada | null>(null);
  const [capturandoPosicao, setCapturandoPosicao] = useState(true);
  const [motivoFalhaPosicao, setMotivoFalhaPosicao] = useState<MotivoFalhaPosicao | null>(null);
  const [idLocal] = useState(() => crypto.randomUUID());
  const [erro, setErro] = useState<string | null>(null);
  const [divergencia, setDivergencia] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    capturarPosicao();
  }, []);

  // Prévia da foto escolhida: o motorista confere se o documento saiu legível antes de encerrar.
  const [urlPrevia, setUrlPrevia] = useState<string | null>(null);
  useEffect(() => () => {
    if (urlPrevia) {
      URL.revokeObjectURL(urlPrevia);
    }
  }, [urlPrevia]);

  function escolherFoto(arquivo: File | null) {
    setFoto(arquivo);
    setUrlPrevia(arquivo ? URL.createObjectURL(arquivo) : null);
  }

  async function capturarPosicao() {
    setCapturandoPosicao(true);
    setMotivoFalhaPosicao(null);
    const resultado = await obterPosicaoDetalhada();
    setPosicao(resultado.posicao);
    setMotivoFalhaPosicao(resultado.motivo);
    setCapturandoPosicao(false);
  }

  async function enviar(justificativaDivergencia: string | null = null) {
    if (!entregaId || !foto) {
      return;
    }
    setErro(null);
    setEnviando(true);
    const dataHora = new Date().toISOString();
    try {
      // Offline (HU08, FR-001): a foto vai para a fila em base64, que é o
      // formato que o lote de sincronização aceita (PayloadComprovanteRegistrado).
      const { enfileirado } = await executarOuEnfileirar(
        () =>
          registrarComprovante(entregaId, {
            foto,
            identificacaoRecebedor: identificacaoRecebedor.trim(),
            dataHora,
            posicao,
            idLocal,
            justificativaDivergencia,
          }),
        {
          tipoEvento: "COMPROVANTE_REGISTRADO",
          payload: {
            entregaId,
            fotoBase64: await arquivoParaBase64(foto),
            nomeArquivo: foto.name,
            identificacaoRecebedor: identificacaoRecebedor.trim(),
            dataHora,
            latitude: posicao?.latitude ?? null,
            longitude: posicao?.longitude ?? null,
            justificativaDivergencia,
          },
        },
      );
      navegar("/motorista", {
        state: {
          aviso: enfileirado
            ? "Comprovante salvo neste aparelho. Ele será enviado assim que houver conexão."
            : "Comprovante enviado e entrega encerrada.",
        },
      });
    } catch (excecao) {
      setConfirmando(false);
      if (excecao instanceof ApiError && excecao.status === 422 && excecao.tipo?.includes(TIPO_DIVERGENCIA)) {
        setDivergencia(excecao.message);
      } else {
        setErro(excecao instanceof ApiError ? excecao.message : "Não foi possível registrar o comprovante.");
      }
    } finally {
      setEnviando(false);
    }
  }

  const podeEnviar = !!foto && identificacaoRecebedor.trim().length > 0 && !!posicao && !enviando;
  const pendencias = [!foto && "tire a foto", !identificacaoRecebedor.trim() && "informe quem recebeu", !posicao && (capturandoPosicao ? "aguarde a localização" : "libere a localização")].filter(Boolean);

  return (
    <TelaMotorista titulo="Comprovante de entrega" voltarPara={`/motorista/entregas/${entregaId}`} rotuloVoltar="Voltar para a entrega">
      {erro && <Alerta tipo="erro">{erro}</Alerta>}

      <div className="formulario">
        <div>
          <span id="rotulo-foto" className="destaque" style={{ display: "block", marginBottom: "0.375rem", fontSize: "1rem" }}>
            1. Foto do documento assinado <span className="campo-obrigatorio" aria-hidden="true">*</span>
          </span>
          {urlPrevia && <img src={urlPrevia} alt="Foto do comprovante escolhida" className="previa-foto mb-2" />}
          <label className={`seletor-foto${foto ? " preenchido" : ""}`}>
            <Icone nome={foto ? "checkCirculo" : "camera"} />
            <strong>{foto ? "Foto pronta. Toque para trocar" : "Tirar foto do documento"}</strong>
            {!foto && <span>Use a câmera traseira, com o documento inteiro na imagem.</span>}
            <input
              id="foto-comprovante"
              className="visualmente-oculto"
              required
              aria-required="true"
              aria-labelledby="rotulo-foto"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(evento) => escolherFoto(evento.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <div>
          <label htmlFor="recebedor">
            2. Quem recebeu <span className="campo-obrigatorio" aria-hidden="true">*</span>
          </label>
          <input
            id="recebedor"
            required
            aria-required="true"
            type="text"
            autoComplete="off"
            autoCapitalize="words"
            value={identificacaoRecebedor}
            onChange={(evento) => setIdentificacaoRecebedor(evento.target.value)}
            placeholder="Nome e/ou documento de quem recebeu"
          />
        </div>

        {/* Edge case do spec: falha de GPS não pode custar os campos já
            preenchidos - o formulário continua montado e só a captura é
            refeita. */}
        {capturandoPosicao ? (
          <Carregando texto="Capturando a localização…" />
        ) : posicao ? (
          <Alerta tipo="sucesso">
            <strong>Localização capturada.</strong> Data, hora e local entram no comprovante automaticamente.
          </Alerta>
        ) : (
          <Alerta tipo="aviso">
            <p>
              <strong>Não foi possível capturar a localização</strong>, e ela é obrigatória no comprovante.
            </p>
            {motivoFalhaPosicao && <p>{ORIENTACAO_FALHA_POSICAO[motivoFalhaPosicao]}</p>}
            <button type="button" className="secundario" onClick={capturarPosicao}>
              <Icone nome="pino" /> Tentar novamente
            </button>
          </Alerta>
        )}
      </div>

      {divergencia ? (
        <JustificativaDivergencia mensagem={divergencia} aoReenviar={(justificativa) => enviar(justificativa)} ocupado={enviando} />
      ) : (
        <>
          <div className="acao-fixa">
            <button type="button" className="sucesso grande bloco" onClick={() => setConfirmando(true)} disabled={!podeEnviar}>
              <Icone nome="checkCirculo" /> {enviando ? "Registrando…" : "Registrar e encerrar entrega"}
            </button>
            {!podeEnviar && !enviando && (
              <p className="texto-apoio centro mb-0">
                Para continuar: {pendencias.join(", ")}.
              </p>
            )}
          </div>
          <ConfirmarAcao
            aberto={confirmando}
            titulo="Encerrar a entrega?"
            descricao="O comprovante será registrado e a entrega será encerrada. Confira a foto e o nome de quem recebeu antes de continuar."
            rotuloConfirmar="Encerrar entrega"
            ocupado={enviando}
            aoConfirmar={() => enviar()}
            aoCancelar={() => setConfirmando(false)}
          />
        </>
      )}

      <Ajuda>
        <p>Tire uma foto do documento assinado e informe quem recebeu a bagagem. A data, a hora e a localização são registradas automaticamente. Sem internet, o comprovante fica salvo no aparelho e é enviado depois.</p>
      </Ajuda>
    </TelaMotorista>
  );
}
