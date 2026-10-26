import { Icone } from "../../../shared/ui/Icone";
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatarData, formatarMoeda, hojeIso, mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { ConfirmarAcao } from "../../../shared/ui/ConfirmarAcao";
import { gerarFechamento, listarFechamentos } from "./fechamentoApi";
import { Alerta, Carregando, Vazio } from "../../../shared/ui/Alerta";
import { Pagina, Painel } from "../layout/Pagina";

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
    <Pagina
      titulo="Fechamentos"
      descricao="Gere o fechamento de um período para ver quanto pagar a cada motorista. Pagamento de entregas e reembolso de pedágios saem sempre separados."
    >
      <Painel
        titulo="Gerar fechamento"
        descricao="Gerar o mesmo período de novo devolve o fechamento existente. Períodos que cruzam um fechamento já feito são recusados."
      >
        <form
          onSubmit={(evento) => {
            evento.preventDefault();
            setConfirmando(true);
          }}
          className="form-linha"
        >
          <div>
            <label htmlFor="periodoInicio">De</label>
            <input id="periodoInicio" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </div>
          <div>
            <label htmlFor="periodoFim">Até</label>
            <input
              id="periodoFim"
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              aria-invalid={fim < inicio}
              aria-describedby={fim < inicio ? "periodo-erro" : undefined}
            />
          </div>
          <button type="submit" disabled={!inicio || !fim || fim < inicio || gerando}>
            <Icone nome="calendario" /> {gerando ? "Gerando…" : "Gerar fechamento"}
          </button>
        </form>
        {fim < inicio && (
          <p id="periodo-erro" className="texto-erro">
            A data final precisa ser igual ou depois da inicial.
          </p>
        )}
      </Painel>

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
        <Alerta tipo="sucesso" aoFechar={() => setGerado(null)}>
          {gerado}
        </Alerta>
      )}
      {(erro || erroAcao) && <Alerta tipo="erro">{erro ?? erroAcao}</Alerta>}
      {carregando && <Carregando texto="Carregando fechamentos…" />}

      {dados && dados.length === 0 && (
        <div className="mt-5">
          <Vazio icone="calendario" titulo="Nenhum fechamento gerado ainda">
            Escolha o período acima e gere o primeiro.
          </Vazio>
        </div>
      )}

      {dados && dados.length > 0 && (
        <Painel titulo="Fechamentos gerados" className="sem-recuo">
          <div className="tabela-rolavel">
            <table className="tabela">
              <thead>
                <tr>
                  <th scope="col">Período</th>
                  <th scope="col">Situação</th>
                  <th scope="col" className="numero">
                    Motoristas
                  </th>
                  <th scope="col" className="numero">
                    Pagamento de entregas
                  </th>
                  <th scope="col" className="numero">
                    Reembolso de pedágios
                  </th>
                  <th scope="col" className="coluna-acoes">
                    <span className="visualmente-oculto">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {dados.map((fechamento) => {
                  const pagamento = fechamento.totaisPorMotorista.reduce((soma, t) => soma + t.totalPagamentoEntregas, 0);
                  const pedagio = fechamento.totaisPorMotorista.reduce((soma, t) => soma + t.totalReembolsoPedagios, 0);
                  const periodo = `${formatarData(fechamento.periodoInicio)} a ${formatarData(fechamento.periodoFim)}`;
                  return (
                    <tr key={fechamento.id}>
                      <td className="sem-quebra">
                        <strong>{periodo}</strong>
                      </td>
                      <td>
                        {fechamento.status === "COM_PENDENCIAS" ? (
                          <span className="selo selo-aviso">
                            <Icone nome="alerta" /> Com pendências
                          </span>
                        ) : (
                          <span className="selo selo-sucesso">
                            <Icone nome="check" /> Completo
                          </span>
                        )}
                      </td>
                      <td className="numero">{fechamento.totaisPorMotorista.length}</td>
                      <td className="numero">
                        <strong>{formatarMoeda(pagamento)}</strong>
                      </td>
                      <td className="numero">{formatarMoeda(pedagio)}</td>
                      <td className="coluna-acoes">
                        <Link
                          to={`/admin/fechamentos/${fechamento.id}`}
                          className="botao fantasma compacto"
                          aria-label={`Ver fechamento de ${periodo}`}
                        >
                          Ver detalhes <Icone nome="chevron" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Painel>
      )}
    </Pagina>
  );
}
