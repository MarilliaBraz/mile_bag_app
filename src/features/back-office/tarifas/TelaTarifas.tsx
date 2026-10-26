import { useState } from "react";
import { formatarData, formatarMoeda, mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { obterTextos, useTextos } from "../../../shared/i18n/idioma";
import { listarMotoristas, nomeDoMotorista, type Motorista } from "../motoristas/motoristasApi";
import { TarifaForm } from "./TarifaForm";
import { atualizarTarifa, criarTarifa, listarTarifas, removerTarifa, type EscopoTarifa, type Tarifa } from "./tarifasApi";
import { Alerta, Carregando, Vazio } from "../../../shared/ui/Alerta";
import { ConfirmarAcao } from "../../../shared/ui/ConfirmarAcao";
import { Icone } from "../../../shared/ui/Icone";
import { Gaveta, Pagina, Painel } from "../layout/Pagina";

function alvoDe(tarifa: Tarifa, motoristas: Motorista[] | null): string {
  if (tarifa.escopo === "MOTORISTA") {
    return nomeDoMotorista(motoristas, tarifa.motoristaId);
  }
  const t = obterTextos().backOffice.tarifas;
  return tarifa.escopo === "REGIAO" ? (tarifa.regiao ?? t.regiaoNaoInformada) : t.todos;
}

const TOM_ESCOPO: Record<EscopoTarifa, string> = { PADRAO: "selo-info", MOTORISTA: "selo-sucesso", REGIAO: "selo-aviso" };

/** Tabelas de tarifa da empresa (HU09): a mais específica vale (motorista > região > padrão, FR-004). */
export function TelaTarifas() {
  const textos = useTextos().backOffice;
  const t = textos.tarifas;
  const ROTULO_ESCOPO = t.escopos;
  const { dados: tarifas, erro, carregando, recarregar } = useRecurso(listarTarifas, t.falhaCarregar);
  const { dados: motoristas } = useRecurso(listarMotoristas, textos.motoristas.falhaCarregar);
  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState<Tarifa | null>(null);
  const [excluindo, setExcluindo] = useState<Tarifa | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);

  async function excluir(id: string) {
    setErroAcao(null);
    try {
      await removerTarifa(id);
      setExcluindo(null);
      setResultado(t.excluida);
      await recarregar();
    } catch (excecao) {
      setExcluindo(null);
      setErroAcao(mensagemDeErro(excecao, t.falhaExcluir));
    }
  }

  const semPadrao = tarifas !== null && !tarifas.some((tarifa) => tarifa.escopo === "PADRAO");

  return (
    <Pagina
      titulo={t.titulo}
      descricao={t.descricao}
      acoes={
        <button type="button" onClick={() => setCriando(true)}>
          <Icone nome="mais" /> {t.novaTarifa}
        </button>
      }
    >
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {erroAcao && <Alerta tipo="erro">{erroAcao}</Alerta>}
      {resultado && (
        <Alerta tipo="sucesso" aoFechar={() => setResultado(null)}>
          {resultado}
        </Alerta>
      )}
      {semPadrao && (
        <Alerta tipo="aviso">
          <strong>{t.semPadrao}</strong> {t.semPadraoDica}
        </Alerta>
      )}
      {carregando && <Carregando texto={t.carregando} />}

      {tarifas && tarifas.length === 0 && (
        <Vazio icone="moeda" titulo={t.nenhuma}>
          {t.nenhumaDica}
        </Vazio>
      )}

      {tarifas && tarifas.length > 0 && (
        <Painel className="sem-recuo">
          <div className="tabela-rolavel">
            <table className="tabela">
              <thead>
                <tr>
                  <th scope="col">{t.colunaAplicaA}</th>
                  <th scope="col" className="numero">
                    {t.colunaValorFixo}
                  </th>
                  <th scope="col" className="numero">
                    {t.colunaPorKm}
                  </th>
                  <th scope="col">{t.colunaVigente}</th>
                  <th scope="col" className="coluna-acoes">
                    <span className="visualmente-oculto">{textos.geral.acoes}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tarifas.map((tarifa) => (
                  <tr key={tarifa.id}>
                    <td>
                      <span className={`selo ${TOM_ESCOPO[tarifa.escopo]}`}>{ROTULO_ESCOPO[tarifa.escopo]}</span>{" "}
                      <strong className="quebrar">{alvoDe(tarifa, motoristas)}</strong>
                    </td>
                    <td className="numero">{formatarMoeda(tarifa.valorFixo)}</td>
                    <td className="numero">{formatarMoeda(tarifa.valorPorKm)}</td>
                    <td>{formatarData(tarifa.vigenteDesde)}</td>
                    <td className="coluna-acoes">
                      <span className="acoes-linha">
                        <button
                          type="button"
                          className="fantasma compacto"
                          onClick={() => setEditando(tarifa)}
                          aria-label={t.editarRotulo(ROTULO_ESCOPO[tarifa.escopo], alvoDe(tarifa, motoristas))}
                        >
                          <Icone nome="lapis" /> {textos.geral.editar}
                        </button>
                        <button
                          type="button"
                          className="fantasma compacto"
                          onClick={() => setExcluindo(tarifa)}
                          aria-label={t.excluirRotulo(ROTULO_ESCOPO[tarifa.escopo], alvoDe(tarifa, motoristas))}
                        >
                          <Icone nome="lixeira" /> {textos.geral.excluir}
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Painel>
      )}

      <ConfirmarAcao
        aberto={excluindo !== null}
        titulo={t.excluirTitulo}
        descricao={excluindo ? t.excluirDescricao(ROTULO_ESCOPO[excluindo.escopo], alvoDe(excluindo, motoristas)) : ""}
        rotuloConfirmar={t.excluirTarifa}
        perigo
        aoConfirmar={() => excluindo && excluir(excluindo.id)}
        aoCancelar={() => setExcluindo(null)}
      />

      <Gaveta aberta={criando} titulo={t.novaTarifa} aoFechar={() => setCriando(false)}>
        <TarifaForm
          aoSalvar={async (dados) => {
            await criarTarifa(dados);
            setCriando(false);
            setResultado(t.cadastrada);
            await recarregar();
          }}
          aoCancelar={() => setCriando(false)}
        />
      </Gaveta>

      <Gaveta
        aberta={editando !== null}
        titulo={editando ? t.editarTitulo(ROTULO_ESCOPO[editando.escopo]) : t.editarTarifa}
        descricao={t.editarDescricao}
        aoFechar={() => setEditando(null)}
      >
        {editando && (
          <TarifaForm
            tarifa={editando}
            aoCancelar={() => setEditando(null)}
            aoSalvar={async (dados) => {
              await atualizarTarifa(editando.id, {
                valorFixo: dados.valorFixo,
                valorPorKm: dados.valorPorKm,
                vigenteDesde: dados.vigenteDesde,
              });
              setEditando(null);
              setResultado(t.atualizada);
              await recarregar();
            }}
          />
        )}
      </Gaveta>
    </Pagina>
  );
}
