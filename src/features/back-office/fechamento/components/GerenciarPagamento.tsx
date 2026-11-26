import { useState } from "react";
import { formatarData, formatarDataHora, hojeIso, mensagemDeErro } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Alerta } from "../../../../shared/components/Alerta";
import { ConfirmarAcao } from "../../../../shared/components/ConfirmarAcao";
import { agendarPagamento, desfazerPago, marcarPago } from "../services/fechamentoService";
import type { PagamentoMotorista } from "../types";
import { rotuloSituacao } from "../utils/pagamento";

const TAMANHO_MAXIMO_MOTIVO = 500;

type Acao = "pago" | "desfazer";

/**
 * Gaveta do pagamento de um motorista: agendar a data, marcar como pago (com confirmação) e, se foi por engano,
 * desfazer o pago com motivo. Embaixo, o rastro de cada passo.
 */
export function GerenciarPagamento({
  fechamentoId,
  pagamento,
  aoAlterar,
}: {
  fechamentoId: string;
  pagamento: PagamentoMotorista;
  aoAlterar: (mensagem: string) => void;
}) {
  const t = useTextos().backOffice.fechamentos.pagamentos;
  const comum = useTextos().comum;
  const pago = pagamento.situacao === "PAGO";
  const [dataAgendada, setDataAgendada] = useState(pagamento.dataAgendada ?? hojeIso());
  const [dataPago, setDataPago] = useState(hojeIso());
  const [motivo, setMotivo] = useState("");
  const [confirmando, setConfirmando] = useState<Acao | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function executar(acao: () => Promise<void>, mensagem: string) {
    setEnviando(true);
    setErro(null);
    try {
      await acao();
      setConfirmando(null);
      aoAlterar(mensagem);
    } catch (excecao) {
      setConfirmando(null);
      setErro(mensagemDeErro(excecao, t.falhaSalvar));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pilha">
      <p>
        <span className={`selo ${pago ? "selo-sucesso" : pagamento.situacao === "AGENDADO" ? "selo-info" : ""}`}>
          {rotuloSituacao(pagamento, t)}
        </span>
      </p>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}

      {!pago && (
        <>
          <form
            className="pilha"
            onSubmit={(evento) => {
              evento.preventDefault();
              void executar(
                () => agendarPagamento(fechamentoId, pagamento.motoristaId, dataAgendada),
                t.agendado(formatarData(dataAgendada)),
              );
            }}
          >
            <h3>{t.agendarTitulo}</h3>
            <div>
              <label htmlFor="data-agendada">{t.dataAgendada}</label>
              <input
                id="data-agendada"
                type="date"
                required
                min={hojeIso()}
                value={dataAgendada}
                onChange={(e) => setDataAgendada(e.target.value)}
              />
            </div>
            <button type="submit" className="secundario" disabled={enviando}>
              {pagamento.situacao === "AGENDADO" ? t.reagendar : t.agendar}
            </button>
          </form>

          <form
            className="pilha divisor-topo"
            onSubmit={(evento) => {
              evento.preventDefault();
              setConfirmando("pago");
            }}
          >
            <h3>{t.pagoTitulo}</h3>
            <div>
              <label htmlFor="data-pago">{t.dataPago}</label>
              <input id="data-pago" type="date" required max={hojeIso()} value={dataPago} onChange={(e) => setDataPago(e.target.value)} />
            </div>
            <button type="submit" disabled={enviando}>
              {t.marcarPago}
            </button>
          </form>
        </>
      )}

      {pago && (
        <form
          className="pilha"
          onSubmit={(evento) => {
            evento.preventDefault();
            setConfirmando("desfazer");
          }}
        >
          <h3>{t.desfazerTitulo}</h3>
          <p className="texto-apoio">{t.desfazerDescricao}</p>
          <div>
            <label htmlFor="motivo-desfazer">{t.motivo}</label>
            <textarea
              id="motivo-desfazer"
              rows={3}
              required
              maxLength={TAMANHO_MAXIMO_MOTIVO}
              value={motivo}
              onChange={(evento) => setMotivo(evento.target.value)}
            />
          </div>
          <button type="submit" className="perigo" disabled={enviando || !motivo.trim()}>
            {t.desfazer}
          </button>
        </form>
      )}

      {pagamento.eventos.length > 0 && (
        <section className="pilha divisor-topo" aria-labelledby="rastro-pagamento">
          <h3 id="rastro-pagamento">{t.rastro}</h3>
          <ul className="linha-tempo">
            {pagamento.eventos.map((evento, indice) => (
              <li key={`${evento.tipo}-${indice}`}>
                <strong>{t.eventos[evento.tipo](formatarData(evento.dataReferencia))}</strong>
                <div className="texto-apoio">{formatarDataHora(evento.dataHora)}</div>
                {evento.motivo && <div>{evento.motivo}</div>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <ConfirmarAcao
        aberto={confirmando === "pago"}
        titulo={t.confirmarPagoTitulo}
        descricao={t.confirmarPagoDescricao(formatarData(dataPago))}
        rotuloConfirmar={t.marcarPago}
        rotuloDesistir={comum.voltar}
        ocupado={enviando}
        aoConfirmar={() => void executar(() => marcarPago(fechamentoId, pagamento.motoristaId, dataPago), t.pago(formatarData(dataPago)))}
        aoCancelar={() => setConfirmando(null)}
      />
      <ConfirmarAcao
        aberto={confirmando === "desfazer"}
        titulo={t.confirmarDesfazerTitulo}
        descricao={t.confirmarDesfazerDescricao}
        rotuloConfirmar={t.desfazer}
        rotuloDesistir={comum.voltar}
        perigo
        ocupado={enviando}
        aoConfirmar={() => void executar(() => desfazerPago(fechamentoId, pagamento.motoristaId, motivo.trim()), t.desfeito)}
        aoCancelar={() => setConfirmando(null)}
      />
    </div>
  );
}
