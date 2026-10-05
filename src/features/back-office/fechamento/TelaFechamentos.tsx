import { Ajuda } from "../../../shared/ui/Ajuda";
import { Icone } from "../../../shared/ui/Icone";
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatarData, formatarMoeda, hojeIso, mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { ConfirmarAcao } from "../../../shared/ui/ConfirmarAcao";
import { gerarFechamento, listarFechamentos } from "./fechamentoApi";
import { Alerta } from "../../../shared/ui/Alerta";

/**
 * Fechamentos do período (HU12). Gerar é idempotente: repetir o mesmo período
 * devolve o fechamento existente; um período que cruza outro já fechado é
 * recusado pela API (409), e a mensagem dela aparece aqui.
 */
export function TelaFechamentos() {
  const { dados, erro, carregando, recarregar } = useRecurso(listarFechamentos, "Não foi possível carregar os fechamentos.");
  const [inicio, setInicio] = useState(hojeIso());
  const [fim, setFim] = useState(hojeIso());
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [gerado, setGerado] = useState<string | null>(null);

  async function gerar() {
    setErroAcao(null);
    setGerado(null);
    setGerando(true);
    try {
      await gerarFechamento(inicio, fim);
      await recarregar();
      setGerado(`Fechamento de ${formatarData(inicio)} a ${formatarData(fim)} gerado.`);
    } catch (excecao) {
      setErroAcao(mensagemDeErro(excecao, "Não foi possível gerar o fechamento."));
    } finally {
      setGerando(false);
      setConfirmando(false);
    }
  }

  return (
    <main>
      <h1>Fechamentos</h1>
      <Ajuda>
        <p>Escolha o período e gere o fechamento para ver o total a pagar por motorista. Gerar o mesmo período de novo devolve o fechamento existente. Períodos que se cruzam com um fechamento já feito são recusados.</p>
      </Ajuda>

      <form onSubmit={(evento) => { evento.preventDefault(); setConfirmando(true); }} style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "end", marginBottom: "1rem" }}>
        <div>
          <label htmlFor="periodoInicio">De</label>
          <input id="periodoInicio" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
        </div>
        <div>
          <label htmlFor="periodoFim">Até</label>
          <input id="periodoFim" type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
        </div>
        <button type="submit" disabled={!inicio || !fim || fim < inicio || gerando}>
          {gerando ? "Gerando…" : "Gerar fechamento do período"}
        </button>
      </form>

      <ConfirmarAcao
        aberto={confirmando}
        titulo="Gerar o fechamento?"
        descricao={`Será gerado o fechamento de ${formatarData(inicio)} a ${formatarData(fim)}. Repetir o mesmo período devolve o fechamento já existente.`}
        rotuloConfirmar="Gerar fechamento"
        ocupado={gerando}
        aoConfirmar={gerar}
        aoCancelar={() => setConfirmando(false)}
      />

      {gerado && (
        <Alerta tipo="sucesso">
          <Icone nome="checkCirculo" /> {gerado}
        </Alerta>
      )}

      {(erro || erroAcao) && (
        <Alerta tipo="erro">
          {erro ?? erroAcao}
        </Alerta>
      )}
      {carregando && <p role="status">Carregando…</p>}
      {dados && dados.length === 0 && <p>Nenhum fechamento gerado ainda.</p>}

      {dados && dados.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {dados.map((fechamento) => {
            const pagamento = fechamento.totaisPorMotorista.reduce((soma, t) => soma + t.totalPagamentoEntregas, 0);
            const pedagio = fechamento.totaisPorMotorista.reduce((soma, t) => soma + t.totalReembolsoPedagios, 0);
            return (
              <li key={fechamento.id} style={{ border: "1px solid var(--borda)", borderRadius: 8, padding: "0.75rem", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "0.5rem" }}>
                  <div>
                    <strong>
                      {formatarData(fechamento.periodoInicio)} a {formatarData(fechamento.periodoFim)}
                    </strong>{" "}
                    {fechamento.status === "COM_PENDENCIAS" && <span style={{ color: "var(--aviso)" }}>· com pendências</span>}
                    <div>
                      Pagamento de entregas: {formatarMoeda(pagamento)} · Reembolso de pedágios: {formatarMoeda(pedagio)}
                    </div>
                  </div>
                  <Link to={`/admin/fechamentos/${fechamento.id}`}>Ver itens e relatórios →</Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
