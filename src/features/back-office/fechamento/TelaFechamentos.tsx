import { Icone } from "../../../shared/ui/Icone";
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatarData, formatarMoeda, hojeIso, mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { useTextos } from "../../../shared/i18n/idioma";
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
  const textos = useTextos().backOffice;
  const t = textos.fechamentos;
  const { dados, erro, carregando, recarregar } = useRecurso(listarFechamentos, t.falhaCarregar);
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
      setGerado(t.gerado(t.periodo(formatarData(inicio), formatarData(fim))));
    } catch (excecao) {
      setErroAcao(mensagemDeErro(excecao, t.falhaGerar));
    } finally {
      setGerando(false);
      setConfirmando(false);
    }
  }

  return (
    <Pagina titulo={t.titulo} descricao={t.descricao}>
      <Painel titulo={t.gerarTitulo} descricao={t.gerarDescricao}>
        <form
          onSubmit={(evento) => {
            evento.preventDefault();
            setConfirmando(true);
          }}
          className="form-linha"
        >
          <div>
            <label htmlFor="periodoInicio">{t.de}</label>
            <input id="periodoInicio" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </div>
          <div>
            <label htmlFor="periodoFim">{t.ate}</label>
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
            <Icone nome="calendario" /> {gerando ? t.gerando : t.gerar}
          </button>
        </form>
        {fim < inicio && (
          <p id="periodo-erro" className="texto-erro">
            {t.dataFinalAntes}
          </p>
        )}
      </Painel>

      <ConfirmarAcao
        aberto={confirmando}
        titulo={t.confirmarTitulo}
        descricao={t.confirmarDescricao(t.periodo(formatarData(inicio), formatarData(fim)))}
        rotuloConfirmar={t.gerar}
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
      {carregando && <Carregando texto={t.carregando} />}

      {dados && dados.length === 0 && (
        <div className="mt-5">
          <Vazio icone="calendario" titulo={t.nenhum}>
            {t.nenhumDica}
          </Vazio>
        </div>
      )}

      {dados && dados.length > 0 && (
        <Painel titulo={t.gerados} className="sem-recuo">
          <div className="tabela-rolavel">
            <table className="tabela">
              <thead>
                <tr>
                  <th scope="col">{t.colunaPeriodo}</th>
                  <th scope="col">{t.colunaSituacao}</th>
                  <th scope="col" className="numero">
                    {t.colunaMotoristas}
                  </th>
                  <th scope="col" className="numero">
                    {t.pagamentoEntregas}
                  </th>
                  <th scope="col" className="numero">
                    {t.reembolsoPedagios}
                  </th>
                  <th scope="col" className="coluna-acoes">
                    <span className="visualmente-oculto">{textos.geral.acoes}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {dados.map((fechamento) => {
                  const pagamento = fechamento.totaisPorMotorista.reduce((soma, total) => soma + total.totalPagamentoEntregas, 0);
                  const pedagio = fechamento.totaisPorMotorista.reduce((soma, total) => soma + total.totalReembolsoPedagios, 0);
                  const periodo = t.periodo(formatarData(fechamento.periodoInicio), formatarData(fechamento.periodoFim));
                  return (
                    <tr key={fechamento.id}>
                      <td className="sem-quebra">
                        <strong>{periodo}</strong>
                      </td>
                      <td>
                        {fechamento.status === "COM_PENDENCIAS" ? (
                          <span className="selo selo-aviso">
                            <Icone nome="alerta" /> {t.comPendencias}
                          </span>
                        ) : (
                          <span className="selo selo-sucesso">
                            <Icone nome="check" /> {t.completo}
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
                          aria-label={t.verRotulo(periodo)}
                        >
                          {t.verDetalhes} <Icone nome="chevron" />
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
