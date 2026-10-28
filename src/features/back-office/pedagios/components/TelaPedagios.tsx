import { Fragment, useId, useState } from "react";
import { formatarData, formatarMoeda, mensagemDeErro } from "../../../../shared/utils/formatar";
import { useRecurso } from "../../../../shared/hooks/useRecurso";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { adicionarValor, criarPraca, definirLocalizacaoDaPraca, historicoDaPraca, listarPracas } from "../services/pedagiosService";
import type { PracaPedagio } from "../types";
import { ValorPedagioForm } from "./ValorPedagioForm";
import { Alerta, Carregando, Vazio } from "../../../../shared/components/Alerta";
import { Icone } from "../../../../shared/components/Icone";
import { Gaveta, Pagina, Painel } from "../../../../shared/components/Pagina";

function LocalizacaoForm({ praca, aoConcluir }: { praca: PracaPedagio; aoConcluir: () => Promise<void> }) {
  const uid = useId();
  const [latitude, setLatitude] = useState(praca.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(praca.longitude?.toString() ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const t = useTextos().backOffice.pedagios;

  const lat = Number(latitude.trim().replace(",", "."));
  const lon = Number(longitude.trim().replace(",", "."));
  const valida = latitude.trim() !== "" && longitude.trim() !== "" && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;

  async function salvar(latitudeNova: number | null, longitudeNova: number | null) {
    setErro(null);
    try {
      await definirLocalizacaoDaPraca(praca.id, latitudeNova, longitudeNova);
      await aoConcluir();
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaLocalizacao));
    }
  }

  return (
    <form
      onSubmit={(evento) => {
        evento.preventDefault();
        void salvar(lat, lon);
      }}
      className="formulario"
    >
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      <p className="texto-apoio m-0">{t.dicaCoordenadas}</p>
      <div className="form-linha">
        <div>
          <label htmlFor={`${uid}-lat`}>{t.latitude}</label>
          <input
            id={`${uid}-lat`}
            inputMode="decimal"
            placeholder="-16.6869"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-lon`}>{t.longitude}</label>
          <input
            id={`${uid}-lon`}
            inputMode="decimal"
            placeholder="-49.2648"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
          />
        </div>
      </div>
      <div className="linha-acoes">
        <button type="submit" disabled={!valida}>
          {t.salvarLocalizacao}
        </button>
        {praca.latitude !== null && (
          <button type="button" className="perigo-contorno" onClick={() => void salvar(null, null)}>
            {t.removerLocalizacao}
          </button>
        )}
      </div>
    </form>
  );
}

function HistoricoValores({ praca }: { praca: PracaPedagio }) {
  const t = useTextos().backOffice.pedagios;
  const { dados, erro, carregando } = useRecurso(() => historicoDaPraca(praca.id), t.falhaHistorico);
  if (erro) {
    return <Alerta tipo="erro">{erro}</Alerta>;
  }
  if (carregando || !dados) {
    return <Carregando texto={t.carregandoHistorico} />;
  }
  return (
    <ol className="linha-tempo" style={{ margin: "0.25rem 0 0" }}>
      {dados.map((item) => (
        <li key={item.vigenteDesde}>
          <strong>{formatarMoeda(item.valor)}</strong> <span className="texto-apoio">{t.aPartirDe(formatarData(item.vigenteDesde))}</span>
        </li>
      ))}
    </ol>
  );
}

/** Praças de pedágio da empresa (HU10): cada mudança de valor vira uma nova vigência, sem apagar a anterior. */
export function TelaPedagios() {
  const textos = useTextos().backOffice;
  const t = textos.pedagios;
  const { dados: pracas, erro, carregando, recarregar } = useRecurso(listarPracas, t.falhaCarregar);
  const [criando, setCriando] = useState(false);
  const [aberta, setAberta] = useState<string | null>(null);
  const [novoValorEm, setNovoValorEm] = useState<PracaPedagio | null>(null);
  const [localizandoEm, setLocalizandoEm] = useState<PracaPedagio | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);
  // Vira a `key` do histórico aberto para ele recarregar depois de um valor novo.
  const [versao, setVersao] = useState(0);

  const semLocalizacao = pracas?.filter((praca) => praca.latitude === null || praca.longitude === null).length ?? 0;

  return (
    <Pagina
      titulo={t.titulo}
      descricao={t.descricao}
      acoes={
        <button type="button" onClick={() => setCriando(true)}>
          <Icone nome="mais" /> {t.novaPraca}
        </button>
      }
    >
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {resultado && (
        <Alerta tipo="sucesso" aoFechar={() => setResultado(null)}>
          {resultado}
        </Alerta>
      )}
      {semLocalizacao > 0 && (
        <Alerta tipo="aviso">
          <strong>{t.semLocalizacao(semLocalizacao)}</strong> {t.semLocalizacaoDica}
        </Alerta>
      )}
      {carregando && <Carregando texto={t.carregando} />}
      {pracas && pracas.length === 0 && (
        <Vazio icone="pedagio" titulo={t.nenhuma}>
          {t.nenhumaDica}
        </Vazio>
      )}

      {pracas && pracas.length > 0 && (
        <Painel className="sem-recuo">
          <div className="tabela-rolavel">
            <table className="tabela">
              <thead>
                <tr>
                  <th scope="col">{t.colunaPraca}</th>
                  <th scope="col" className="numero">
                    {t.colunaValor}
                  </th>
                  <th scope="col">{t.colunaDesde}</th>
                  <th scope="col">{t.colunaLocalizacao}</th>
                  <th scope="col" className="coluna-acoes">
                    <span className="visualmente-oculto">{textos.geral.acoes}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pracas.map((praca) => {
                  const localizada = praca.latitude !== null && praca.longitude !== null;
                  return (
                    <Fragment key={praca.id}>
                      <tr>
                        <td>
                          <strong>{praca.nome}</strong>
                        </td>
                        <td className="numero">
                          {praca.valorVigente === null ? (
                            <span className="texto-apoio">{t.semValorHoje}</span>
                          ) : (
                            formatarMoeda(praca.valorVigente)
                          )}
                        </td>
                        <td>{formatarData(praca.vigenteDesde)}</td>
                        <td>
                          {localizada ? (
                            <span className="selo selo-sucesso" title={`${praca.latitude}, ${praca.longitude}`}>
                              <Icone nome="pino" /> {t.localizada}
                            </span>
                          ) : (
                            <span className="selo selo-aviso">
                              <Icone nome="alerta" /> {t.seloSemLocalizacao}
                            </span>
                          )}
                        </td>
                        <td className="coluna-acoes">
                          <span className="acoes-linha">
                            <button
                              type="button"
                              className="fantasma compacto"
                              aria-expanded={aberta === praca.id}
                              onClick={() => setAberta(aberta === praca.id ? null : praca.id)}
                              aria-label={t.historicoRotulo(praca.nome)}
                            >
                              <Icone nome="historico" /> {t.historico}
                            </button>
                            <button
                              type="button"
                              className="fantasma compacto"
                              onClick={() => setLocalizandoEm(praca)}
                              aria-label={t.localizacaoRotulo(praca.nome)}
                            >
                              <Icone nome="pino" /> {t.localizacao}
                            </button>
                            <button
                              type="button"
                              className="fantasma compacto"
                              onClick={() => setNovoValorEm(praca)}
                              aria-label={t.novoValorRotulo(praca.nome)}
                            >
                              <Icone nome="mais" /> {t.novoValor}
                            </button>
                          </span>
                        </td>
                      </tr>
                      {aberta === praca.id && (
                        <tr className="linha-detalhe">
                          <td colSpan={5}>
                            <HistoricoValores key={versao} praca={praca} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Painel>
      )}

      <Gaveta aberta={criando} titulo={t.novaPracaTitulo} aoFechar={() => setCriando(false)}>
        <ValorPedagioForm
          pedirNome
          rotuloAcao={t.cadastrarPraca}
          aoCancelar={() => setCriando(false)}
          aoSalvar={async (dados) => {
            await criarPraca(dados);
            setCriando(false);
            setResultado(t.pracaCadastrada(dados.nome));
            await recarregar();
          }}
        />
      </Gaveta>

      <Gaveta
        aberta={novoValorEm !== null}
        titulo={t.novoValorTitulo(novoValorEm?.nome ?? "")}
        descricao={t.novoValorDescricao}
        aoFechar={() => setNovoValorEm(null)}
      >
        {novoValorEm && (
          <ValorPedagioForm
            rotuloAcao={t.registrarNovoValor}
            aoCancelar={() => setNovoValorEm(null)}
            aoSalvar={async ({ valor, vigenteDesde }) => {
              await adicionarValor(novoValorEm.id, { valor, vigenteDesde });
              setResultado(t.novoValorRegistrado(novoValorEm.nome));
              setNovoValorEm(null);
              setVersao((v) => v + 1);
              await recarregar();
            }}
          />
        )}
      </Gaveta>

      <Gaveta
        aberta={localizandoEm !== null}
        titulo={t.localizacaoTitulo(localizandoEm?.nome ?? "")}
        descricao={t.localizacaoDescricao}
        aoFechar={() => setLocalizandoEm(null)}
      >
        {localizandoEm && (
          <LocalizacaoForm
            praca={localizandoEm}
            aoConcluir={async () => {
              setResultado(t.localizacaoAtualizada(localizandoEm.nome));
              setLocalizandoEm(null);
              await recarregar();
            }}
          />
        )}
      </Gaveta>
    </Pagina>
  );
}
