import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mensagemDeErro } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { TelaMotorista } from "../../../../shared/components/TelaMotorista";
import { Alerta } from "../../../../shared/components/Alerta";
import { Icone } from "../../../../shared/components/Icone";
import { CampoFoto } from "../../../../shared/components/CampoFoto";
import { FotosAvaria } from "../../../../shared/components/FotosAvaria";
import { CamposMotivoCorrecao } from "../../../../shared/components/CamposMotivoCorrecao";
import { corrigirRetirada } from "../services/correcaoService";

/**
 * V51: corrigir a retirada antes de iniciar a viagem - foto nova e/ou avarias novas, com motivo. A foto antiga não é
 * apagada: fica no histórico da mala como substituída. Precisa de internet.
 */
export function CorrigirRetirada() {
  const { entregaId } = useParams<{ entregaId: string }>();
  const navegar = useNavigate();
  const textos = useTextos();
  const t = textos.motorista.corrigirRetirada;
  const r = textos.motorista.retirada;
  const [motivoId, setMotivoId] = useState("");
  const [complemento, setComplemento] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [corrigirAvarias, setCorrigirAvarias] = useState(false);
  const [avarias, setAvarias] = useState<File[]>([]);
  const [observacao, setObservacao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const temAlteracao = !!foto || corrigirAvarias;

  async function enviar() {
    if (!entregaId || enviando) {
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await corrigirRetirada(entregaId, {
        motivoId,
        complemento: complemento.trim() || null,
        foto,
        corrigirAvarias,
        avarias,
        observacaoAvaria: avarias.length > 0 && observacao.trim() ? observacao.trim() : null,
      });
      navegar(`/motorista/entregas/${entregaId}/rota`, { state: { aviso: t.corrigida } });
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falha));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <TelaMotorista titulo={t.titulo} voltarPara={`/motorista/entregas/${entregaId}`} rotuloVoltar={textos.motorista.geral.voltarEntrega}>
      <p className="texto-apoio">{t.explicacao}</p>
      <div className="formulario">
        <CamposMotivoCorrecao
          motivoId={motivoId}
          aoMudarMotivo={setMotivoId}
          complemento={complemento}
          aoMudarComplemento={setComplemento}
        />
        <CampoFoto
          id="foto-retirada-nova"
          rotulo={t.fotoNova}
          tirarFoto={r.tirarFoto}
          fotoPronta={r.fotoPronta}
          previa={r.previa}
          foto={foto}
          aoEscolher={setFoto}
          opcional
        />
        <label className="interruptor">
          <input type="checkbox" checked={corrigirAvarias} onChange={(evento) => setCorrigirAvarias(evento.target.checked)} />
          {t.corrigirAvarias}
        </label>
        {corrigirAvarias && (
          <FotosAvaria
            id="avarias-retirada-novas"
            fotos={avarias}
            aoMudarFotos={setAvarias}
            observacao={observacao}
            aoMudarObservacao={setObservacao}
          />
        )}
      </div>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      <div className="acao-fixa">
        <button
          type="button"
          className="sucesso grande bloco"
          onClick={() => void enviar()}
          disabled={!motivoId || !temAlteracao || enviando}
        >
          <Icone nome="ferramenta" /> {enviando ? textos.comum.salvando : t.salvar}
        </button>
        {!temAlteracao && <p className="texto-apoio centro mb-0">{t.oQueCorrigir}</p>}
      </div>
    </TelaMotorista>
  );
}
