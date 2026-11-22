import { Icone } from "../../../../shared/components/Icone";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../../../../shared/services/ApiError";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { arquivoParaBase64, executarOuEnfileirar, fotoParaFila, fotosParaFila } from "../../../../shared/services/fila";
import { listarMotivosComOrigem } from "../../../../shared/services/ocorrenciaService";
import type { MotivoOcorrencia } from "../../../../shared/types/ocorrencia";
import { usePosicaoAtual } from "../../../../shared/hooks/usePosicaoAtual";
import { TelaMotorista } from "../../../../shared/components/TelaMotorista";
import { JustificativaDivergencia } from "../../../../shared/components/JustificativaDivergencia";
import { Ajuda } from "../../../../shared/components/Ajuda";
import { Alerta, Carregando } from "../../../../shared/components/Alerta";
import { ConfirmarAcao } from "../../../../shared/components/ConfirmarAcao";
import { CampoFoto } from "../../../../shared/components/CampoFoto";
import { FotosAvaria } from "../../../../shared/components/FotosAvaria";
import { PedirMotivoCorrecao } from "../../../../shared/components/PedirMotivoCorrecao";
import { registrarComprovante } from "../services/comprovanteService";
import { ConferenciaMalas } from "../../painel-entregas/components/ConferenciaMalas";
import { encerrarViagemNoAparelho } from "../../../../shared/utils/viagemEmAndamento";
import { enviarCaminhoPendente } from "../../../../shared/services/caminhoViagem";
import type { CorrecaoNoFluxo } from "../types";

type EtapaNoFluxo = CorrecaoNoFluxo["etapa"];
/**
 * O que fica guardado ao liberar uma etapa concluída; o "depois" é lido ao finalizar. `valorAntes` (a foto ou o
 * texto de quem assinou) diz se algo mudou de fato: liberar e desistir não vira correção.
 */
type CorrecaoAberta = Omit<CorrecaoNoFluxo, "depois"> & { valorAntes: File | string | null };

const TIPO_DIVERGENCIA = "divergencia-trajeto-sem-justificativa";
const TAMANHO_MAXIMO_NOME = 200;

/**
 * Registro da entrega (HU06; V48, itens 4 e 5) - passo a passo, cada campo abre quando o anterior estiver pronto: foto
 * da bagagem na porta, foto do BDO assinado, quem assinou (lista da empresa) e o nome, e fotos de avaria opcionais.
 * Data/hora e coordenadas são capturadas automaticamente. Registrar encerra a entrega e consolida o trajeto (HU04) na
 * mesma transação do back-end.
 *
 * <p>Por isso este formulário também trata a recusa por divergência de quilometragem (RN14): o back-end responde `422`
 * com o tipo {@code divergencia-trajeto-sem-justificativa}, e o reenvio acontece com a justificativa preenchida, sem
 * perder fotos nem campos já preenchidos.</p>
 */
export function RegistrarComprovante() {
  const { entregaId } = useParams<{ entregaId: string }>();
  const navegar = useNavigate();
  const textos = useTextos();
  const t = textos.motorista.comprovante;
  const { posicao, capturando: capturandoPosicao, motivoFalha: motivoFalhaPosicao, capturar: capturarPosicao } = usePosicaoAtual();

  const [fotoPorta, setFotoPorta] = useState<File | null>(null);
  const [foto, setFoto] = useState<File | null>(null);
  const [tipos, setTipos] = useState<MotivoOcorrencia[] | null>(null);
  const [tiposDoCache, setTiposDoCache] = useState(false);
  const [tipoRecebedorId, setTipoRecebedorId] = useState("");
  const [nomeRecebedor, setNomeRecebedor] = useState("");
  const [avarias, setAvarias] = useState<File[]>([]);
  const [observacao, setObservacao] = useState("");
  const [idLocal] = useState(() => crypto.randomUUID());
  const [erro, setErro] = useState<string | null>(null);
  const [divergencia, setDivergencia] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  // Item 8: o motorista confere as malas antes de finalizar (sem internet, não bloqueia).
  const [malasLiberadas, setMalasLiberadas] = useState(false);
  // V51: voltar a uma etapa concluída pede motivo; cada correção vai junto com a entrega (inclusive sem internet).
  const [correcoes, setCorrecoes] = useState<CorrecaoAberta[]>([]);
  const [liberadas, setLiberadas] = useState<ReadonlySet<EtapaNoFluxo>>(new Set());
  const [pedindoMotivo, setPedindoMotivo] = useState<EtapaNoFluxo | null>(null);

  useEffect(() => {
    listarMotivosComOrigem("RECEBEDOR")
      .then((resposta) => {
        setTipos(resposta.motivos);
        setTiposDoCache(resposta.doCache);
      })
      .catch(() => setTipos([]));
  }, []);

  const tipoEscolhido = tipos?.find((tipo) => tipo.id === tipoRecebedorId) ?? null;
  const nome = nomeRecebedor.trim();
  // Passo a passo: cada etapa abre quando a anterior estiver pronta.
  const podeFotoBdo = !!fotoPorta;
  const podeRecebedor = podeFotoBdo && !!foto;
  const recebedorPronto = podeRecebedor && !!tipoEscolhido && nome.length > 0;
  const podeEnviar = recebedorPronto && !!posicao && malasLiberadas && !enviando;
  const textoRecebedor = `${tipoEscolhido?.descricao ?? "?"} - ${nome}`;
  // Uma etapa está concluída quando a seguinte já começou: dali em diante, alterar pede motivo.
  const portaConcluida = !!fotoPorta && !!foto && !liberadas.has("FOTO_PORTA");
  const bdoConcluido = !!foto && (!!tipoRecebedorId || nome.length > 0) && !liberadas.has("FOTO_BDO_ASSINADO");
  const recebedorConcluido = recebedorPronto && avarias.length > 0 && !liberadas.has("RECEBEDOR");
  const nomeDaEtapa: Record<EtapaNoFluxo, string> = { FOTO_PORTA: t.fotoPorta, FOTO_BDO_ASSINADO: t.foto, RECEBEDOR: t.quemRecebeu };

  function liberarEtapa(motivoId: string, complemento: string | null) {
    const etapa = pedindoMotivo;
    if (!etapa) {
      return;
    }
    const antes = etapa === "RECEBEDOR" ? textoRecebedor : t.fotoAnterior;
    const valorAntes = etapa === "RECEBEDOR" ? textoRecebedor : etapa === "FOTO_PORTA" ? fotoPorta : foto;
    setCorrecoes((atuais) => [...atuais, { etapa, motivoId, complemento, antes, valorAntes, dataHora: new Date().toISOString() }]);
    setLiberadas((atuais) => new Set(atuais).add(etapa));
    setPedindoMotivo(null);
  }

  /** Foto nova de uma etapa liberada: a etapa volta a ficar travada. */
  function trocarFoto(etapa: EtapaNoFluxo, aplicar: (foto: File | null) => void) {
    return (nova: File | null) => {
      aplicar(nova);
      if (nova) {
        setLiberadas((atuais) => {
          const resto = new Set(atuais);
          resto.delete(etapa);
          return resto;
        });
      }
    };
  }
  const pendencias = [
    !fotoPorta && t.pendenciaPorta,
    !foto && t.pendenciaFoto,
    !recebedorPronto && t.pendenciaRecebedor,
    !posicao && (capturandoPosicao ? t.pendenciaAguardeLocal : t.pendenciaLibereLocal),
    !malasLiberadas && textos.motorista.malas.pendencia,
  ].filter(Boolean);

  async function enviar(justificativaDivergencia: string | null = null) {
    if (!entregaId || !foto || !fotoPorta || !tipoEscolhido) {
      return;
    }
    setErro(null);
    setEnviando(true);
    const dataHora = new Date().toISOString();
    const identificacaoRecebedor = `${tipoEscolhido.descricao} - ${nome}`;
    const observacaoAvaria = avarias.length > 0 && observacao.trim() ? observacao.trim() : null;
    const valorAtual: Record<EtapaNoFluxo, File | string | null> = {
      FOTO_PORTA: fotoPorta,
      FOTO_BDO_ASSINADO: foto,
      RECEBEDOR: identificacaoRecebedor,
    };
    // Só vai o que mudou de verdade (liberar e desistir não é correção).
    const correcoesFeitas: CorrecaoNoFluxo[] = correcoes
      .filter((correcao) => valorAtual[correcao.etapa] !== correcao.valorAntes)
      .map(({ valorAntes: _valorAntes, ...correcao }) => ({
        ...correcao,
        depois: correcao.etapa === "RECEBEDOR" ? identificacaoRecebedor : t.fotoNova,
      }));
    try {
      // Offline (HU08, FR-001): as fotos vão para a fila em base64, o formato que o lote de sincronização aceita.
      const { enfileirado } = await executarOuEnfileirar(
        () =>
          registrarComprovante(entregaId, {
            foto,
            fotoPorta,
            tipoRecebedorId: tipoEscolhido.id,
            nomeRecebedor: nome,
            avarias,
            observacaoAvaria,
            identificacaoRecebedor,
            dataHora,
            posicao,
            idLocal,
            justificativaDivergencia,
            correcoes: correcoesFeitas,
          }),
        {
          tipoEvento: "COMPROVANTE_REGISTRADO",
          payload: {
            entregaId,
            fotoBase64: await arquivoParaBase64(foto),
            nomeArquivo: foto.name,
            identificacaoRecebedor,
            dataHora,
            latitude: posicao?.latitude ?? null,
            longitude: posicao?.longitude ?? null,
            justificativaDivergencia,
            fotoPorta: await fotoParaFila(fotoPorta),
            tipoRecebedorId: tipoEscolhido.id,
            nomeRecebedor: nome,
            avarias: await fotosParaFila(avarias),
            observacaoAvaria,
            correcoes: correcoesFeitas,
          },
        },
      );
      // Item 9: a viagem terminou neste aparelho - para de gravar o caminho e manda o que ficou guardado.
      encerrarViagemNoAparelho(entregaId);
      void enviarCaminhoPendente(true);
      navegar("/motorista", { state: { aviso: enfileirado ? t.naFila : t.enviado } });
    } catch (excecao) {
      setConfirmando(false);
      if (excecao instanceof ApiError && excecao.status === 422 && excecao.tipo?.includes(TIPO_DIVERGENCIA)) {
        setDivergencia(excecao.message);
      } else {
        setErro(excecao instanceof ApiError ? excecao.message : t.falha);
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <TelaMotorista titulo={t.titulo} voltarPara={`/motorista/entregas/${entregaId}`} rotuloVoltar={textos.motorista.geral.voltarEntrega}>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}

      <div className="formulario">
        <CampoFoto
          id="foto-porta"
          rotulo={t.fotoPorta}
          tirarFoto={t.tirarFotoPorta}
          fotoPronta={t.fotoPronta}
          dica={t.dicaPorta}
          previa={t.previaPorta}
          foto={fotoPorta}
          aoEscolher={trocarFoto("FOTO_PORTA", setFotoPorta)}
          bloqueado={portaConcluida}
          aoCorrigir={() => setPedindoMotivo("FOTO_PORTA")}
          rotuloCorrigir={textos.correcao.corrigir}
        />

        <CampoFoto
          id="foto-comprovante"
          rotulo={t.foto}
          tirarFoto={t.tirarFoto}
          fotoPronta={t.fotoPronta}
          dica={t.dicaFoto}
          previa={t.previa}
          foto={foto}
          aoEscolher={trocarFoto("FOTO_BDO_ASSINADO", setFoto)}
          desabilitado={!podeFotoBdo}
          bloqueado={bdoConcluido}
          aoCorrigir={() => setPedindoMotivo("FOTO_BDO_ASSINADO")}
          rotuloCorrigir={textos.correcao.corrigir}
        />

        <fieldset
          className={`pilha${podeRecebedor && !recebedorConcluido ? "" : " campo-bloqueado"}`}
          disabled={!podeRecebedor || recebedorConcluido}
        >
          <legend className="destaque">
            {t.quemRecebeu}{" "}
            <span className="campo-obrigatorio" aria-hidden="true">
              *
            </span>
          </legend>
          {tipos === null ? (
            <Carregando />
          ) : tipos.length === 0 ? (
            <Alerta tipo="aviso">{t.semTiposRecebedor}</Alerta>
          ) : (
            <>
              {tiposDoCache && <p className="texto-apoio m-0">{t.tiposDoCache}</p>}
              <div>
                <label htmlFor="tipo-recebedor">{t.tipoRecebedor}</label>
                <select id="tipo-recebedor" required value={tipoRecebedorId} onChange={(evento) => setTipoRecebedorId(evento.target.value)}>
                  <option value="" disabled>
                    {t.escolhaTipo}
                  </option>
                  {tipos.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.descricao}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="nome-recebedor">{t.nomeRecebedor}</label>
                <input
                  id="nome-recebedor"
                  required
                  aria-required="true"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="words"
                  maxLength={TAMANHO_MAXIMO_NOME}
                  value={nomeRecebedor}
                  onChange={(evento) => setNomeRecebedor(evento.target.value)}
                />
              </div>
            </>
          )}
        </fieldset>
        {recebedorConcluido && (
          <div>
            <button
              type="button"
              className="secundario"
              aria-label={`${textos.correcao.corrigir}: ${t.quemRecebeu}`}
              onClick={() => setPedindoMotivo("RECEBEDOR")}
            >
              <Icone nome="ferramenta" /> {textos.correcao.corrigir}
            </button>
          </div>
        )}

        <div className={recebedorPronto ? undefined : "campo-bloqueado"}>
          <FotosAvaria
            id="avarias-entrega"
            fotos={avarias}
            aoMudarFotos={setAvarias}
            observacao={observacao}
            aoMudarObservacao={setObservacao}
            desabilitado={!recebedorPronto}
          />
        </div>

        {/* Edge case do spec: falha de GPS não pode custar os campos já preenchidos - o formulário continua montado e
            só a captura é refeita. */}
        {capturandoPosicao ? (
          <Carregando texto={t.capturandoLocal} />
        ) : posicao ? (
          <Alerta tipo="sucesso">
            <strong>{t.localCapturado}</strong> {t.localAutomatico}
          </Alerta>
        ) : (
          <Alerta tipo="aviso">
            <p>
              <strong>{t.localFalhou}</strong>
              {t.localObrigatorio}
            </p>
            {motivoFalhaPosicao && <p>{textos.posicao[motivoFalhaPosicao]}</p>}
            <button type="button" className="secundario" onClick={() => void capturarPosicao()}>
              <Icone nome="pino" /> {t.tentarNovamente}
            </button>
          </Alerta>
        )}
      </div>

      {entregaId && <ConferenciaMalas entregaId={entregaId} momento="entrega" aoMudar={setMalasLiberadas} />}

      {divergencia ? (
        <JustificativaDivergencia mensagem={divergencia} aoReenviar={(justificativa) => enviar(justificativa)} ocupado={enviando} />
      ) : (
        <>
          <div className="acao-fixa">
            <button type="button" className="sucesso grande bloco" onClick={() => setConfirmando(true)} disabled={!podeEnviar}>
              <Icone nome="checkCirculo" /> {enviando ? t.registrando : t.registrarEncerrar}
            </button>
            {!podeEnviar && !enviando && <p className="texto-apoio centro mb-0">{t.paraContinuar(pendencias.join(", "))}</p>}
          </div>
          <ConfirmarAcao
            aberto={confirmando}
            titulo={t.encerrarTitulo}
            descricao={t.encerrarDescricao}
            rotuloConfirmar={t.encerrarEntrega}
            ocupado={enviando}
            aoConfirmar={() => enviar()}
            aoCancelar={() => setConfirmando(false)}
          />
        </>
      )}

      <PedirMotivoCorrecao
        aberto={pedindoMotivo !== null}
        etapa={pedindoMotivo ? nomeDaEtapa[pedindoMotivo] : ""}
        aoConfirmar={liberarEtapa}
        aoCancelar={() => setPedindoMotivo(null)}
      />

      <Ajuda>
        <p>{t.ajuda}</p>
      </Ajuda>
    </TelaMotorista>
  );
}
