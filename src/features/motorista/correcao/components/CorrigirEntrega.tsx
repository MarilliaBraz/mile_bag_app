import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatarDataHora, mensagemDeErro } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { TelaMotorista } from "../../../../shared/components/TelaMotorista";
import { Alerta, Carregando } from "../../../../shared/components/Alerta";
import { Icone } from "../../../../shared/components/Icone";
import { CampoFoto } from "../../../../shared/components/CampoFoto";
import { FotosAvaria } from "../../../../shared/components/FotosAvaria";
import { CamposMotivoCorrecao } from "../../../../shared/components/CamposMotivoCorrecao";
import { listarMotivos } from "../../../../shared/services/ocorrenciaService";
import type { MotivoOcorrencia } from "../../../../shared/types/ocorrencia";
import { consultarDetalhe } from "../../painel-entregas/services/painelService";
import { corrigirEntrega } from "../services/correcaoService";

const TAMANHO_MAXIMO_NOME = 200;

/**
 * V51: corrigir a entrega já finalizada, até 24 h depois - fotos (porta, BDO assinado, avarias) e quem assinou, sempre
 * com motivo. Nenhuma foto é apagada; a empresa vê a entrega com o selo "Corrigida" e o antes/depois no histórico.
 */
export function CorrigirEntrega() {
  const { entregaId } = useParams<{ entregaId: string }>();
  const navegar = useNavigate();
  const textos = useTextos();
  const t = textos.motorista.corrigirEntrega;
  const c = textos.motorista.comprovante;
  const [ate, setAte] = useState<string | null | undefined>(undefined);
  const [tipos, setTipos] = useState<MotivoOcorrencia[]>([]);
  const [motivoId, setMotivoId] = useState("");
  const [complemento, setComplemento] = useState("");
  const [fotoPorta, setFotoPorta] = useState<File | null>(null);
  const [fotoDocumento, setFotoDocumento] = useState<File | null>(null);
  const [corrigirRecebedor, setCorrigirRecebedor] = useState(false);
  const [tipoRecebedorId, setTipoRecebedorId] = useState("");
  const [nomeRecebedor, setNomeRecebedor] = useState("");
  const [corrigirAvarias, setCorrigirAvarias] = useState(false);
  const [avarias, setAvarias] = useState<File[]>([]);
  const [observacao, setObservacao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!entregaId) {
      return;
    }
    consultarDetalhe(entregaId)
      .then((detalhe) => setAte(detalhe.corrigivelAte ?? null))
      .catch(() => setAte(null));
    listarMotivos("RECEBEDOR")
      .then(setTipos)
      .catch(() => setTipos([]));
  }, [entregaId]);

  const recebedorPronto = !corrigirRecebedor || (!!tipoRecebedorId && nomeRecebedor.trim().length > 0);
  const temAlteracao = !!fotoPorta || !!fotoDocumento || corrigirRecebedor || corrigirAvarias;
  const podeSalvar = !!motivoId && temAlteracao && recebedorPronto && !enviando;

  async function enviar() {
    if (!entregaId || !podeSalvar) {
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await corrigirEntrega(entregaId, {
        motivoId,
        complemento: complemento.trim() || null,
        fotoPorta,
        fotoDocumento,
        tipoRecebedorId: corrigirRecebedor ? tipoRecebedorId : null,
        nomeRecebedor: corrigirRecebedor ? nomeRecebedor.trim() : null,
        corrigirAvarias,
        avarias,
        observacaoAvaria: avarias.length > 0 && observacao.trim() ? observacao.trim() : null,
      });
      navegar("/motorista", { state: { aviso: t.corrigida } });
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falha));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <TelaMotorista titulo={t.titulo} voltarPara="/motorista" rotuloVoltar={textos.motorista.geral.voltarPainel}>
      {ate === undefined ? (
        <Carregando />
      ) : ate === null ? (
        <Alerta tipo="aviso">{t.prazoEncerrado}</Alerta>
      ) : (
        <>
          <Alerta tipo="info">{t.prazo(formatarDataHora(ate))}</Alerta>
          <div className="formulario">
            <CamposMotivoCorrecao
              motivoId={motivoId}
              aoMudarMotivo={setMotivoId}
              complemento={complemento}
              aoMudarComplemento={setComplemento}
            />
            <CampoFoto
              id="foto-porta-nova"
              rotulo={t.fotoPortaNova}
              tirarFoto={c.tirarFotoPorta}
              fotoPronta={c.fotoPronta}
              previa={c.previaPorta}
              foto={fotoPorta}
              aoEscolher={setFotoPorta}
              opcional
            />
            <CampoFoto
              id="foto-bdo-nova"
              rotulo={t.fotoDocumentoNova}
              tirarFoto={c.tirarFoto}
              fotoPronta={c.fotoPronta}
              previa={c.previa}
              foto={fotoDocumento}
              aoEscolher={setFotoDocumento}
              opcional
            />
            <label className="interruptor">
              <input type="checkbox" checked={corrigirRecebedor} onChange={(evento) => setCorrigirRecebedor(evento.target.checked)} />
              {t.corrigirRecebedor}
            </label>
            {corrigirRecebedor && (
              <div className="pilha">
                <div>
                  <label htmlFor="tipo-recebedor-novo">{c.tipoRecebedor}</label>
                  <select
                    id="tipo-recebedor-novo"
                    required
                    value={tipoRecebedorId}
                    onChange={(evento) => setTipoRecebedorId(evento.target.value)}
                  >
                    <option value="" disabled>
                      {c.escolhaTipo}
                    </option>
                    {tipos.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.descricao}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="nome-recebedor-novo">{c.nomeRecebedor}</label>
                  <input
                    id="nome-recebedor-novo"
                    type="text"
                    required
                    autoComplete="off"
                    autoCapitalize="words"
                    maxLength={TAMANHO_MAXIMO_NOME}
                    value={nomeRecebedor}
                    onChange={(evento) => setNomeRecebedor(evento.target.value)}
                  />
                </div>
              </div>
            )}
            <label className="interruptor">
              <input type="checkbox" checked={corrigirAvarias} onChange={(evento) => setCorrigirAvarias(evento.target.checked)} />
              {t.corrigirAvarias}
            </label>
            {corrigirAvarias && (
              <FotosAvaria
                id="avarias-entrega-novas"
                fotos={avarias}
                aoMudarFotos={setAvarias}
                observacao={observacao}
                aoMudarObservacao={setObservacao}
              />
            )}
          </div>
          {erro && <Alerta tipo="erro">{erro}</Alerta>}
          <div className="acao-fixa">
            <button type="button" className="sucesso grande bloco" onClick={() => void enviar()} disabled={!podeSalvar}>
              <Icone nome="ferramenta" /> {enviando ? textos.comum.salvando : t.salvar}
            </button>
            {!temAlteracao && <p className="texto-apoio centro mb-0">{t.oQueCorrigir}</p>}
          </div>
        </>
      )}
    </TelaMotorista>
  );
}
