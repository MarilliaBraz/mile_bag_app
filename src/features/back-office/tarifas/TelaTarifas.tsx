import { useState } from "react";
import { formatarData, formatarMoeda, mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { listarMotoristas, nomeDoMotorista, type Motorista } from "../motoristas/motoristasApi";
import { TarifaForm } from "./TarifaForm";
import { atualizarTarifa, criarTarifa, listarTarifas, removerTarifa, type EscopoTarifa, type Tarifa } from "./tarifasApi";
import { Alerta, Carregando, Vazio } from "../../../shared/ui/Alerta";
import { ConfirmarAcao } from "../../../shared/ui/ConfirmarAcao";
import { Icone } from "../../../shared/ui/Icone";
import { Gaveta, Pagina, Painel } from "../layout/Pagina";

const ROTULO_ESCOPO: Record<EscopoTarifa, string> = { PADRAO: "Padrão", MOTORISTA: "Motorista", REGIAO: "Região" };

function alvoDe(tarifa: Tarifa, motoristas: Motorista[] | null): string {
  if (tarifa.escopo === "MOTORISTA") {
    return nomeDoMotorista(motoristas, tarifa.motoristaId);
  }
  return tarifa.escopo === "REGIAO" ? (tarifa.regiao ?? "Região não informada") : "Todos";
}

const TOM_ESCOPO: Record<EscopoTarifa, string> = { PADRAO: "selo-info", MOTORISTA: "selo-sucesso", REGIAO: "selo-aviso" };

/** Tabelas de tarifa da empresa (HU09): a mais específica vale (motorista > região > padrão, FR-004). */
export function TelaTarifas() {
  const { dados: tarifas, erro, carregando, recarregar } = useRecurso(listarTarifas, "Não foi possível carregar as tarifas.");
  const { dados: motoristas } = useRecurso(listarMotoristas, "Não foi possível carregar os motoristas.");
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
      setResultado("Tarifa excluída.");
      await recarregar();
    } catch (excecao) {
      setExcluindo(null);
      setErroAcao(mensagemDeErro(excecao, "Não foi possível excluir a tarifa."));
    }
  }

  const semPadrao = tarifas !== null && !tarifas.some((tarifa) => tarifa.escopo === "PADRAO");

  return (
    <Pagina
      titulo="Tarifas"
      descricao="Quanto o motorista recebe por entrega: valor fixo, valor por km ou os dois. Vale a mais específica: motorista, depois região, depois a padrão."
      acoes={
        <button type="button" onClick={() => setCriando(true)}>
          <Icone nome="mais" /> Nova tarifa
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
          <strong>Não há tarifa padrão.</strong> Entregas de motoristas e regiões sem tarifa própria ficam pendentes no fechamento.
        </Alerta>
      )}
      {carregando && <Carregando texto="Carregando tarifas…" />}

      {tarifas && tarifas.length === 0 && (
        <Vazio icone="moeda" titulo="Nenhuma tarifa cadastrada">
          Comece pela tarifa padrão da empresa.
        </Vazio>
      )}

      {tarifas && tarifas.length > 0 && (
        <Painel className="sem-recuo">
          <div className="tabela-rolavel">
            <table className="tabela">
              <thead>
                <tr>
                  <th scope="col">Aplica a</th>
                  <th scope="col" className="numero">Valor fixo</th>
                  <th scope="col" className="numero">Por km</th>
                  <th scope="col">Vigente desde</th>
                  <th scope="col" className="coluna-acoes">
                    <span className="visualmente-oculto">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tarifas.map((tarifa) => (
                  <tr key={tarifa.id}>
                    <td>
                      <span className={`selo ${TOM_ESCOPO[tarifa.escopo]}`}>{ROTULO_ESCOPO[tarifa.escopo]}</span>{" "}
                      <strong style={{ wordBreak: "break-word" }}>{alvoDe(tarifa, motoristas)}</strong>
                    </td>
                    <td className="numero">{formatarMoeda(tarifa.valorFixo)}</td>
                    <td className="numero">{formatarMoeda(tarifa.valorPorKm)}</td>
                    <td>{formatarData(tarifa.vigenteDesde)}</td>
                    <td className="coluna-acoes">
                      <span className="acoes-linha">
                        <button type="button" className="fantasma compacto" onClick={() => setEditando(tarifa)} aria-label={`Editar tarifa ${ROTULO_ESCOPO[tarifa.escopo]} ${alvoDe(tarifa, motoristas)}`}>
                          <Icone nome="lapis" /> Editar
                        </button>
                        <button type="button" className="fantasma compacto" onClick={() => setExcluindo(tarifa)} aria-label={`Excluir tarifa ${ROTULO_ESCOPO[tarifa.escopo]} ${alvoDe(tarifa, motoristas)}`}>
                          <Icone nome="lixeira" /> Excluir
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
        titulo="Excluir esta tarifa?"
        descricao={excluindo ? `A tarifa ${ROTULO_ESCOPO[excluindo.escopo].toLowerCase()} (${alvoDe(excluindo, motoristas)}) deixa de valer para os próximos cálculos. Fechamentos já emitidos não mudam.` : ""}
        rotuloConfirmar="Excluir tarifa"
        perigo
        aoConfirmar={() => excluindo && excluir(excluindo.id)}
        aoCancelar={() => setExcluindo(null)}
      />

      <Gaveta aberta={criando} titulo="Nova tarifa" aoFechar={() => setCriando(false)}>
        <TarifaForm
          aoSalvar={async (dados) => {
            await criarTarifa(dados);
            setCriando(false);
            setResultado("Tarifa cadastrada.");
            await recarregar();
          }}
          aoCancelar={() => setCriando(false)}
        />
      </Gaveta>

      <Gaveta
        aberta={editando !== null}
        titulo={editando ? `Editar tarifa · ${ROTULO_ESCOPO[editando.escopo]}` : "Editar tarifa"}
        descricao="Só valores e vigência mudam. Viagens já encerradas e fechamentos emitidos não são recalculados."
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
              setResultado("Tarifa atualizada.");
              await recarregar();
            }}
          />
        )}
      </Gaveta>
    </Pagina>
  );
}
