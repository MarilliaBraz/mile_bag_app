import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Icone } from "../../../../shared/components/Icone";
import { Alerta } from "../../../../shared/components/Alerta";
import { ApiError } from "../../../../shared/services/ApiError";
import { obterPosicaoAtual } from "../../../../shared/utils/posicaoAtual";
import { registrarCheckpoint } from "../services/viagemService";

/**
 * "Cheguei ao endereço" (HU20): um toque registra o marco de chegada - o passageiro é avisado pelo servidor - e leva
 * direto ao registro da entrega, o próximo passo. O "Estou a caminho" deixou de ser um toque à parte: iniciar a viagem
 * já avisa o passageiro, e ele recebe um aviso só (pedido da usuária, 2026-11-22).
 *
 * <p>Sem GPS o marco vai do mesmo jeito (o servidor guarda `ausente = true`). Sem conexão o marco não é registrado
 * (não há evento de checkpoint na fila offline): o motorista segue para o registro da entrega mesmo assim.</p>
 */
export function MarcoChegada({ entregaId }: { entregaId: string }) {
  const t = useTextos().motorista.rota;
  const navigate = useNavigate();
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const irParaRegistro = () => navigate(`/motorista/entregas/${entregaId}/comprovante`, { viewTransition: true });

  async function registrar() {
    setErro(null);
    setOcupado(true);
    try {
      await registrarCheckpoint(entregaId, "CHEGADA", await obterPosicaoAtual(5_000));
      irParaRegistro();
    } catch (excecao) {
      if (excecao instanceof ApiError) {
        setErro(excecao.message);
      } else {
        // Sem conexão: o aviso de chegada fica para trás, mas a entrega não pode parar por isso.
        irParaRegistro();
      }
    } finally {
      setOcupado(false);
    }
  }

  return (
    <>
      <button type="button" className="sucesso grande bloco mt-3" onClick={registrar} disabled={ocupado}>
        <Icone nome="pino" /> {ocupado ? t.registrando : t.chegueiAoEndereco}
      </button>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
    </>
  );
}
