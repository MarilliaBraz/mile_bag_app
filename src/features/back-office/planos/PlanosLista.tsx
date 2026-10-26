import { useState } from "react";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { PlanoForm } from "./PlanoForm";
import { criarPlano, listarPlanos, removerPlano, type PlanoComUso } from "./planosApi";
import { Alerta, Carregando, Vazio } from "../../../shared/ui/Alerta";
import { ConfirmarAcao } from "../../../shared/ui/ConfirmarAcao";
import { Icone } from "../../../shared/ui/Icone";
import { Gaveta, Pagina, Painel } from "../layout/Pagina";

/** Planos de assinatura (HU16). Um plano com empresas associadas não pode ser removido - o botão nem aparece. */
export function PlanosLista() {
  const { dados, erro, carregando, recarregar } = useRecurso(listarPlanos, "Não foi possível carregar os planos.");
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const [excluindo, setExcluindo] = useState<PlanoComUso | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);

  async function excluir(id: string) {
    setErroAcao(null);
    try {
      await removerPlano(id);
      setResultado("Plano removido.");
      await recarregar();
    } catch (excecao) {
      setErroAcao(mensagemDeErro(excecao, "Não foi possível remover o plano."));
    } finally {
      setExcluindo(null);
    }
  }

  return (
    <Pagina
      titulo="Planos de assinatura"
      descricao="Cada plano limita os motoristas ativos e os BDOs por mês. Cadastre um plano antes de cadastrar empresas."
      acoes={
        <button type="button" onClick={() => setCriando(true)}>
          <Icone nome="mais" /> Novo plano
        </button>
      }
    >
      {(erro || erroAcao) && <Alerta tipo="erro">{erro ?? erroAcao}</Alerta>}
      {resultado && (
        <Alerta tipo="sucesso" aoFechar={() => setResultado(null)}>
          {resultado}
        </Alerta>
      )}
      {carregando && <Carregando texto="Carregando planos…" />}
      {dados && dados.length === 0 && (
        <Vazio icone="lista" titulo="Nenhum plano cadastrado">
          Cadastre um plano antes de cadastrar empresas.
        </Vazio>
      )}

      {dados && dados.length > 0 && (
        <Painel className="sem-recuo">
          <div className="tabela-rolavel">
            <table className="tabela">
              <thead>
                <tr>
                  <th scope="col">Plano</th>
                  <th scope="col" className="numero">
                    Motoristas ativos
                  </th>
                  <th scope="col" className="numero">
                    BDOs por mês
                  </th>
                  <th scope="col" className="numero">
                    Empresas
                  </th>
                  <th scope="col" className="coluna-acoes">
                    <span className="visualmente-oculto">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {dados.map((item) => (
                  <tr key={item.plano.id}>
                    <td>
                      <strong>{item.plano.nome}</strong>
                    </td>
                    <td className="numero">{item.plano.limiteMotoristasAtivos.toLocaleString("pt-BR")}</td>
                    <td className="numero">{item.plano.limiteVolumeMensalBdos.toLocaleString("pt-BR")}</td>
                    <td className="numero">
                      <span className={`selo ${item.tenantsAssociados > 0 ? "selo-info" : ""}`}>{item.tenantsAssociados}</span>
                    </td>
                    <td className="coluna-acoes">
                      {item.tenantsAssociados > 0 ? (
                        <span className="texto-apoio" title="Planos com empresas associadas não podem ser removidos">
                          Em uso
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="fantasma compacto"
                          onClick={() => setExcluindo(item)}
                          aria-label={`Remover plano ${item.plano.nome}`}
                        >
                          <Icone nome="lixeira" /> Remover
                        </button>
                      )}
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
        titulo={`Remover o plano ${excluindo?.plano.nome ?? ""}?`}
        descricao="Nenhuma empresa usa este plano. Ele deixa de aparecer no cadastro de empresas."
        rotuloConfirmar="Remover plano"
        perigo
        aoConfirmar={() => excluindo && excluir(excluindo.plano.id)}
        aoCancelar={() => setExcluindo(null)}
      />

      <Gaveta aberta={criando} titulo="Novo plano" aoFechar={() => setCriando(false)}>
        <PlanoForm
          aoSalvar={async (dados) => {
            await criarPlano(dados);
            setCriando(false);
            setResultado(`Plano “${dados.nome}” criado.`);
            await recarregar();
          }}
        />
      </Gaveta>
    </Pagina>
  );
}
