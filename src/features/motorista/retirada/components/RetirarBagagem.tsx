import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../../../../shared/services/ApiError";
import { arquivoParaBase64, executarOuEnfileirar, fotosParaFila } from "../../../../shared/services/fila";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { usePosicaoAtual } from "../../../../shared/hooks/usePosicaoAtual";
import { marcarRetiradaLocal } from "../../../../shared/utils/retiradaLocal";
import { TelaMotorista } from "../../../../shared/components/TelaMotorista";
import { Alerta, Carregando } from "../../../../shared/components/Alerta";
import { Ajuda } from "../../../../shared/components/Ajuda";
import { CampoFoto } from "../../../../shared/components/CampoFoto";
import { FotosAvaria } from "../../../../shared/components/FotosAvaria";
import { Icone } from "../../../../shared/components/Icone";
import { registrarRetirada } from "../services/retiradaService";
import { ConferenciaMalas } from "../../painel-entregas/components/ConferenciaMalas";

/**
 * Retirada da bagagem no aeroporto (V48, itens 4 e 5) - a etapa entre assumir e iniciar a viagem: foto obrigatória da
 * bagagem, fotos de avaria opcionais e a localização, que só é registrada (onde o motorista estiver, sem bloquear).
 * Funciona sem internet: fica na fila e a viagem pode ser iniciada em seguida, na mesma ordem.
 */
export function RetirarBagagem() {
  const { entregaId } = useParams<{ entregaId: string }>();
  const navegar = useNavigate();
  const textos = useTextos();
  const t = textos.motorista.retirada;
  const { posicao, capturando, motivoFalha, capturar } = usePosicaoAtual();
  const [foto, setFoto] = useState<File | null>(null);
  const [avarias, setAvarias] = useState<File[]>([]);
  const [observacao, setObservacao] = useState("");
  const [idLocal] = useState(() => crypto.randomUUID());
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  // Item 8: o motorista confere as malas antes de registrar a retirada (sem internet, não bloqueia).
  const [malasLiberadas, setMalasLiberadas] = useState(false);

  async function registrar() {
    if (!entregaId || !foto) {
      return;
    }
    setErro(null);
    setEnviando(true);
    const dataHora = new Date().toISOString();
    const observacaoAvaria = avarias.length > 0 && observacao.trim() ? observacao.trim() : null;
    try {
      const { enfileirado } = await executarOuEnfileirar(
        () => registrarRetirada(entregaId, { foto, avarias, observacaoAvaria, posicao, dataHora, idLocal }),
        {
          tipoEvento: "RETIRADA_REGISTRADA",
          payload: {
            entregaId,
            fotoBase64: await arquivoParaBase64(foto),
            nomeArquivo: foto.name,
            avarias: await fotosParaFila(avarias),
            observacaoAvaria,
            dataHora,
            latitude: posicao?.latitude ?? null,
            longitude: posicao?.longitude ?? null,
          },
        },
      );
      // So a retirada na fila precisa da marca: a registrada online o servidor ja informa.
      if (enfileirado) {
        marcarRetiradaLocal(entregaId);
      }
      navegar(`/motorista/entregas/${entregaId}/rota`, { state: { aviso: enfileirado ? t.naFila : t.registrada } });
    } catch (excecao) {
      setErro(excecao instanceof ApiError ? excecao.message : t.falha);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <TelaMotorista titulo={t.titulo} voltarPara={`/motorista/entregas/${entregaId}`} rotuloVoltar={textos.motorista.geral.voltarEntrega}>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      <p className="texto-apoio">{t.explicacao}</p>

      <div className="formulario">
        <CampoFoto
          id="foto-retirada"
          rotulo={t.foto}
          tirarFoto={t.tirarFoto}
          fotoPronta={t.fotoPronta}
          dica={t.dicaFoto}
          previa={t.previa}
          foto={foto}
          aoEscolher={setFoto}
        />

        <FotosAvaria
          id="avarias-retirada"
          fotos={avarias}
          aoMudarFotos={setAvarias}
          observacao={observacao}
          aoMudarObservacao={setObservacao}
        />

        {/* H: a localização só é registrada - sem ela a retirada vale do mesmo jeito. */}
        {capturando ? (
          <Carregando texto={t.capturandoLocal} />
        ) : posicao ? (
          <Alerta tipo="sucesso">{t.localCapturado}</Alerta>
        ) : (
          <Alerta tipo="aviso">
            <p>
              <strong>{t.semLocal}</strong>
            </p>
            {motivoFalha && <p>{textos.posicao[motivoFalha]}</p>}
            <button type="button" className="secundario" onClick={() => void capturar()}>
              <Icone nome="pino" /> {t.tentarNovamente}
            </button>
          </Alerta>
        )}
      </div>

      {entregaId && <ConferenciaMalas entregaId={entregaId} momento="retirada" aoMudar={setMalasLiberadas} />}

      <div className="acao-fixa">
        <button
          type="button"
          className="sucesso grande bloco"
          onClick={registrar}
          disabled={!foto || !malasLiberadas || enviando || capturando}
        >
          <Icone nome="mala" /> {enviando ? t.registrando : t.registrar}
        </button>
        {!foto && <p className="texto-apoio centro mb-0">{t.paraContinuar}</p>}
        {foto && !malasLiberadas && (
          <p className="texto-apoio centro mb-0">{textos.motorista.comprovante.paraContinuar(textos.motorista.malas.pendencia)}</p>
        )}
      </div>

      <Ajuda>
        <p>{t.ajuda}</p>
      </Ajuda>
    </TelaMotorista>
  );
}
