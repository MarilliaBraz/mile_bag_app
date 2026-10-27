import { useState } from "react";
import { formatarNumero, mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { useTextos } from "../../../shared/i18n/idioma";
import { PlanoForm } from "./PlanoForm";
import { criarPlano, listarPlanos, removerPlano, type PlanoComUso } from "./planosApi";
import { Alerta, Carregando, Vazio } from "../../../shared/ui/Alerta";
import { ConfirmarAcao } from "../../../shared/ui/ConfirmarAcao";
import { Icone } from "../../../shared/ui/Icone";
import { Gaveta, Pagina, Painel } from "../layout/Pagina";

/** Planos de assinatura (HU16). Um plano com empresas associadas não pode ser removido - o botão nem aparece. */
export function PlanosLista() {
  const textos = useTextos().backOffice;
  const t = textos.planos;
  const { dados, erro, carregando, recarregar } = useRecurso(listarPlanos, t.falhaCarregar);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const [excluindo, setExcluindo] = useState<PlanoComUso | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);

  async function excluir(id: string) {
    setErroAcao(null);
    try {
      await removerPlano(id);
      setResultado(t.removido);
      await recarregar();
    } catch (excecao) {
      setErroAcao(mensagemDeErro(excecao, t.falhaRemover));
    } finally {
      setExcluindo(null);
    }
  }

  return (
    <Pagina
      titulo={t.titulo}
      descricao={t.descricao}
      acoes={
        <button type="button" onClick={() => setCriando(true)}>
          <Icone nome="mais" /> {t.novoPlano}
        </button>
      }
    >
      {(erro || erroAcao) && <Alerta tipo="erro">{erro ?? erroAcao}</Alerta>}
      {resultado && (
        <Alerta tipo="sucesso" aoFechar={() => setResultado(null)}>
          {resultado}
        </Alerta>
      )}
      {carregando && <Carregando texto={t.carregando} />}
      {dados && dados.length === 0 && (
        <Vazio icone="lista" titulo={t.nenhum}>
          {t.nenhumDica}
        </Vazio>
      )}

      {dados && dados.length > 0 && (
        <Painel className="sem-recuo">
          <div className="tabela-rolavel">
            <table className="tabela">
              <thead>
                <tr>
                  <th scope="col">{t.colunaPlano}</th>
                  <th scope="col" className="numero">
                    {t.motoristasAtivos}
                  </th>
                  <th scope="col" className="numero">
                    {t.bdosPorMes}
                  </th>
                  <th scope="col" className="numero">
                    {t.colunaEmpresas}
                  </th>
                  <th scope="col" className="coluna-acoes">
                    <span className="visualmente-oculto">{textos.geral.acoes}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {dados.map((item) => (
                  <tr key={item.plano.id}>
                    <td>
                      <strong>{item.plano.nome}</strong>
                    </td>
                    <td className="numero">{formatarNumero(item.plano.limiteMotoristasAtivos)}</td>
                    <td className="numero">{formatarNumero(item.plano.limiteVolumeMensalBdos)}</td>
                    <td className="numero">
                      <span className={`selo ${item.tenantsAssociados > 0 ? "selo-info" : ""}`}>{item.tenantsAssociados}</span>
                    </td>
                    <td className="coluna-acoes">
                      {item.tenantsAssociados > 0 ? (
                        <span className="texto-apoio" title={t.emUsoDica}>
                          {t.emUso}
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="fantasma compacto"
                          onClick={() => setExcluindo(item)}
                          aria-label={t.removerRotulo(item.plano.nome)}
                        >
                          <Icone nome="lixeira" /> {t.remover}
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
        titulo={t.removerTitulo(excluindo?.plano.nome ?? "")}
        descricao={t.removerDescricao}
        rotuloConfirmar={t.removerPlano}
        perigo
        aoConfirmar={() => excluindo && excluir(excluindo.plano.id)}
        aoCancelar={() => setExcluindo(null)}
      />

      <Gaveta aberta={criando} titulo={t.novoPlano} aoFechar={() => setCriando(false)}>
        <PlanoForm
          aoSalvar={async (dados) => {
            await criarPlano(dados);
            setCriando(false);
            setResultado(t.criado(dados.nome));
            await recarregar();
          }}
        />
      </Gaveta>
    </Pagina>
  );
}
