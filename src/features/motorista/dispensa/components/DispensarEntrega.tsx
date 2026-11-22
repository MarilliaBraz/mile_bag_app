import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../../../../shared/services/ApiError";
import { TelaMotorista } from "../../../../shared/components/TelaMotorista";
import { Alerta, Carregando } from "../../../../shared/components/Alerta";
import { ConfirmarAcao } from "../../../../shared/components/ConfirmarAcao";
import { limparRetiradaLocal } from "../../../../shared/utils/retiradaLocal";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { dispensarEntrega, listarMotivosDispensa } from "../../../../shared/services/dispensaService";
import type { MotivoOcorrencia } from "../../../../shared/types/ocorrencia";
import { encerrarViagemNoAparelho } from "../../../../shared/utils/viagemEmAndamento";
import { enviarCaminhoPendente } from "../../../../shared/services/caminhoViagem";
import { consultarDetalhe } from "../../painel-entregas/services/painelService";

const TAMANHO_MAXIMO_COMPLEMENTO = 500;

/**
 * Dispensa da entrega (V46): o motorista devolve uma entrega que assumiu, e ela volta para a lista dos outros.
 * Antes de retirar a bagagem, na primeira tentativa, o motivo é opcional; depois de sair com a bagagem, ou numa
 * nova tentativa, a API exige um motivo da lista da empresa. Mesmo formato da tela de ocorrência.
 *
 * <p>Precisa de conexão: só o servidor consegue liberar a entrega para os outros motoristas.</p>
 */
export function DispensarEntrega() {
  const { entregaId } = useParams<{ entregaId: string }>();
  const navegar = useNavigate();
  const t = useTextos().motorista.dispensa;

  const [motivoObrigatorio, setMotivoObrigatorio] = useState<boolean | null>(null);
  const [motivos, setMotivos] = useState<MotivoOcorrencia[] | null>(null);
  const [motivoId, setMotivoId] = useState("");
  const [complemento, setComplemento] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    if (!entregaId) {
      return;
    }
    Promise.all([consultarDetalhe(entregaId), listarMotivosDispensa()])
      .then(([detalhe, lista]) => {
        setMotivoObrigatorio(detalhe.motivoDispensaObrigatorio === true);
        setMotivos(lista);
      })
      .catch((excecao) => {
        setErro(excecao instanceof ApiError ? excecao.message : t.falhaCarregar);
        setMotivos([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entregaId]);

  async function enviar() {
    if (!entregaId) {
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await dispensarEntrega(entregaId, motivoId || null, complemento.trim() || null);
      // V48: a retirada desta tentativa deixa de valer; se a entrega voltar, retira-se de novo.
      limparRetiradaLocal(entregaId);
      // Item 9: a viagem terminou neste aparelho - para de gravar o caminho e manda o que ficou guardado.
      encerrarViagemNoAparelho(entregaId);
      void enviarCaminhoPendente(true);
      navegar("/motorista", { replace: true });
    } catch (excecao) {
      setErro(excecao instanceof ApiError ? excecao.message : t.falhaDispensar);
      setConfirmando(false);
    } finally {
      setEnviando(false);
    }
  }

  const carregando = motivos === null || (motivoObrigatorio === null && !erro);
  const pronto = !motivoObrigatorio || Boolean(motivoId);

  return (
    <TelaMotorista titulo={t.titulo} voltarPara={`/motorista/entregas/${entregaId}`}>
      <p className="texto-apoio">{motivoObrigatorio ? t.explicacaoComBagagem : t.explicacao}</p>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {carregando && <Carregando texto={t.carregando} />}

      {!carregando && motivoObrigatorio && motivos?.length === 0 && <Alerta tipo="aviso">{t.semMotivos}</Alerta>}

      {!carregando && motivoObrigatorio !== null && (
        <>
          {motivos && motivos.length > 0 && (
            <fieldset className="escolhas mt-5">
              <legend>
                {motivoObrigatorio ? t.motivo : t.motivoOpcional}{" "}
                {motivoObrigatorio && (
                  <span className="campo-obrigatorio" aria-hidden="true">
                    *
                  </span>
                )}
              </legend>
              {motivos.map((motivo) => (
                <label key={motivo.id} className="escolha">
                  <input
                    type="radio"
                    name="motivo"
                    value={motivo.id}
                    required={motivoObrigatorio}
                    checked={motivoId === motivo.id}
                    onChange={(evento) => setMotivoId(evento.target.value)}
                  />
                  <span>{motivo.descricao}</span>
                </label>
              ))}
            </fieldset>
          )}

          <div className="mt-5">
            <label htmlFor="complemento">{t.complemento}</label>
            <textarea
              id="complemento"
              rows={3}
              maxLength={TAMANHO_MAXIMO_COMPLEMENTO}
              value={complemento}
              onChange={(evento) => setComplemento(evento.target.value)}
              placeholder={t.complementoDica}
            />
          </div>

          <div className="acao-fixa">
            <button type="button" className="grande bloco" onClick={() => setConfirmando(true)} disabled={!pronto || enviando}>
              {enviando ? t.dispensando : t.dispensar}
            </button>
            {!pronto && <p className="texto-apoio centro mb-0">{t.escolhaMotivo}</p>}
          </div>
          <ConfirmarAcao
            aberto={confirmando}
            titulo={t.confirmarTitulo}
            descricao={t.confirmarDescricao}
            rotuloConfirmar={t.dispensar}
            ocupado={enviando}
            aoConfirmar={enviar}
            aoCancelar={() => setConfirmando(false)}
          />
        </>
      )}
    </TelaMotorista>
  );
}
