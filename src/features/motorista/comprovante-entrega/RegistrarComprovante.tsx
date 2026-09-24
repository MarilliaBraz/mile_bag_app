import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../../../shared/api/ApiError";
import { obterPosicaoAtual } from "../../../shared/geo/posicaoAtual";
import type { Coordenada } from "../../../shared/mapa/MapaBase";
import { arquivoParaBase64, executarOuEnfileirar } from "../offline-sync/fila";
import { IndicadorSincronizacao } from "../offline-sync/IndicadorSincronizacao";
import { JustificativaDivergencia } from "../rota/components/JustificativaDivergencia";
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
  const [idLocal] = useState(() => crypto.randomUUID());
  const [erro, setErro] = useState<string | null>(null);
  const [divergencia, setDivergencia] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    capturarPosicao();
  }, []);

  async function capturarPosicao() {
    setCapturandoPosicao(true);
    setPosicao(await obterPosicaoAtual());
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
      await executarOuEnfileirar(
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
      navegar("/motorista");
    } catch (excecao) {
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

  return (
    <main style={{ maxWidth: 560, margin: "2rem auto", padding: "0 1rem" }}>
      <IndicadorSincronizacao />
      <Link to={`/motorista/entregas/${entregaId}`}>← Voltar para a entrega</Link>
      <h1>Comprovante de entrega</h1>

      {erro && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {erro}
        </p>
      )}

      <label htmlFor="foto-comprovante">Foto do documento assinado *</label>
      <input
        id="foto-comprovante"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(evento) => setFoto(evento.target.files?.[0] ?? null)}
      />

      <div style={{ marginTop: "1rem" }}>
        <label htmlFor="recebedor">Quem recebeu *</label>
        <input
          id="recebedor"
          type="text"
          value={identificacaoRecebedor}
          onChange={(evento) => setIdentificacaoRecebedor(evento.target.value)}
          placeholder="Nome e/ou documento de quem recebeu"
        />
      </div>

      {/* Edge case do spec: falha de GPS não pode custar os campos já
          preenchidos - o formulário continua montado e só a captura é
          refeita. */}
      <p style={{ marginTop: "1rem", fontSize: "0.9rem" }} role="status">
        {capturandoPosicao
          ? "Capturando a localização…"
          : posicao
            ? `Localização capturada (${posicao.latitude.toFixed(5)}, ${posicao.longitude.toFixed(5)})`
            : "Não foi possível capturar a localização, e ela é obrigatória no comprovante."}
        {!capturandoPosicao && !posicao && (
          <button className="secundario" onClick={capturarPosicao} style={{ marginLeft: "0.5rem" }}>
            Tentar novamente
          </button>
        )}
      </p>

      {divergencia ? (
        <JustificativaDivergencia mensagem={divergencia} aoReenviar={(justificativa) => enviar(justificativa)} ocupado={enviando} />
      ) : (
        <button onClick={() => enviar()} disabled={!podeEnviar} style={{ marginTop: "1rem" }}>
          {enviando ? "Registrando…" : "Registrar comprovante e encerrar entrega"}
        </button>
      )}
    </main>
  );
}
