import { Fragment, useId, useState } from "react";
import { formatarData, formatarMoeda, mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { adicionarValor, criarPraca, definirLocalizacaoDaPraca, historicoDaPraca, listarPracas, type PracaPedagio } from "./pedagiosApi";
import { ValorPedagioForm } from "./ValorPedagioForm";
import { Alerta, Carregando, Vazio } from "../../../shared/ui/Alerta";
import { Icone } from "../../../shared/ui/Icone";
import { Gaveta, Pagina, Painel } from "../layout/Pagina";

function LocalizacaoForm({ praca, aoConcluir }: { praca: PracaPedagio; aoConcluir: () => Promise<void> }) {
  const uid = useId();
  const [latitude, setLatitude] = useState(praca.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(praca.longitude?.toString() ?? "");
  const [erro, setErro] = useState<string | null>(null);

  const lat = Number(latitude.trim().replace(",", "."));
  const lon = Number(longitude.trim().replace(",", "."));
  const valida = latitude.trim() !== "" && longitude.trim() !== "" && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;

  async function salvar(latitudeNova: number | null, longitudeNova: number | null) {
    setErro(null);
    try {
      await definirLocalizacaoDaPraca(praca.id, latitudeNova, longitudeNova);
      await aoConcluir();
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, "Não foi possível salvar a localização."));
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
      <p className="texto-apoio" style={{ margin: 0 }}>
        No Google Maps, clique com o botão direito no local da praça e copie as coordenadas.
      </p>
      <div className="form-linha">
        <div>
          <label htmlFor={`${uid}-lat`}>Latitude</label>
          <input id={`${uid}-lat`} inputMode="decimal" placeholder="-16.6869" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
        </div>
        <div>
          <label htmlFor={`${uid}-lon`}>Longitude</label>
          <input id={`${uid}-lon`} inputMode="decimal" placeholder="-49.2648" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
        </div>
      </div>
      <div className="linha-acoes">
        <button type="submit" disabled={!valida}>
          Salvar localização
        </button>
        {praca.latitude !== null && (
          <button type="button" className="perigo-contorno" onClick={() => void salvar(null, null)}>
            Remover localização
          </button>
        )}
      </div>
    </form>
  );
}

function HistoricoValores({ praca }: { praca: PracaPedagio }) {
  const { dados, erro, carregando } = useRecurso(() => historicoDaPraca(praca.id), "Não foi possível carregar o histórico.");
  if (erro) {
    return (
      <Alerta tipo="erro">
        {erro}
      </Alerta>
    );
  }
  if (carregando || !dados) {
    return <Carregando texto="Carregando histórico…" />;
  }
  return (
    <ol className="linha-tempo" style={{ margin: "0.25rem 0 0" }}>
      {dados.map((item) => (
        <li key={item.vigenteDesde}>
          <strong>{formatarMoeda(item.valor)}</strong> <span className="texto-apoio">a partir de {formatarData(item.vigenteDesde)}</span>
        </li>
      ))}
    </ol>
  );
}

/** Praças de pedágio da empresa (HU10): cada mudança de valor vira uma nova vigência, sem apagar a anterior. */
export function TelaPedagios() {
  const { dados: pracas, erro, carregando, recarregar } = useRecurso(listarPracas, "Não foi possível carregar as praças.");
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
      titulo="Praças de pedágio"
      descricao="O reembolso ao motorista usa ida e volta, com o valor vigente na data da viagem. Cada mudança de valor vira uma nova vigência, sem apagar a anterior."
      acoes={
        <button type="button" onClick={() => setCriando(true)}>
          <Icone nome="mais" /> Nova praça
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
          <strong>{semLocalizacao} praça(s) sem localização.</strong> Elas não são detectadas nas rotas, e o reembolso desses pedágios fica pendente.
        </Alerta>
      )}
      {carregando && <Carregando texto="Carregando praças…" />}
      {pracas && pracas.length === 0 && (
        <Vazio icone="pedagio" titulo="Nenhuma praça cadastrada">
          Cadastre as praças por onde seus motoristas passam.
        </Vazio>
      )}

      {pracas && pracas.length > 0 && (
        <Painel className="sem-recuo">
          <div className="tabela-rolavel">
            <table className="tabela">
              <thead>
                <tr>
                  <th scope="col">Praça</th>
                  <th scope="col" className="numero">Valor vigente</th>
                  <th scope="col">Desde</th>
                  <th scope="col">Localização</th>
                  <th scope="col" className="coluna-acoes">
                    <span className="visualmente-oculto">Ações</span>
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
                        <td className="numero">{praca.valorVigente === null ? <span className="texto-apoio">Sem valor hoje</span> : formatarMoeda(praca.valorVigente)}</td>
                        <td>{formatarData(praca.vigenteDesde)}</td>
                        <td>
                          {localizada ? (
                            <span className="selo selo-sucesso" title={`${praca.latitude}, ${praca.longitude}`}>
                              <Icone nome="pino" /> Localizada
                            </span>
                          ) : (
                            <span className="selo selo-aviso">
                              <Icone nome="alerta" /> Sem localização
                            </span>
                          )}
                        </td>
                        <td className="coluna-acoes">
                          <span className="acoes-linha">
                            <button type="button" className="fantasma compacto" aria-expanded={aberta === praca.id} onClick={() => setAberta(aberta === praca.id ? null : praca.id)} aria-label={`Histórico de valores de ${praca.nome}`}>
                              <Icone nome="historico" /> Histórico
                            </button>
                            <button type="button" className="fantasma compacto" onClick={() => setLocalizandoEm(praca)} aria-label={`Localização de ${praca.nome}`}>
                              <Icone nome="pino" /> Localização
                            </button>
                            <button type="button" className="fantasma compacto" onClick={() => setNovoValorEm(praca)} aria-label={`Novo valor para ${praca.nome}`}>
                              <Icone nome="mais" /> Novo valor
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

      <Gaveta aberta={criando} titulo="Nova praça de pedágio" aoFechar={() => setCriando(false)}>
        <ValorPedagioForm
          pedirNome
          rotuloAcao="Cadastrar praça"
          aoCancelar={() => setCriando(false)}
          aoSalvar={async (dados) => {
            await criarPraca(dados);
            setCriando(false);
            setResultado(`Praça “${dados.nome}” cadastrada.`);
            await recarregar();
          }}
        />
      </Gaveta>

      <Gaveta
        aberta={novoValorEm !== null}
        titulo={`Novo valor · ${novoValorEm?.nome ?? ""}`}
        descricao="O valor atual continua no histórico e vale até a data escolhida."
        aoFechar={() => setNovoValorEm(null)}
      >
        {novoValorEm && (
          <ValorPedagioForm
            rotuloAcao="Registrar novo valor"
            aoCancelar={() => setNovoValorEm(null)}
            aoSalvar={async ({ valor, vigenteDesde }) => {
              await adicionarValor(novoValorEm.id, { valor, vigenteDesde });
              setResultado(`Novo valor registrado para ${novoValorEm.nome}.`);
              setNovoValorEm(null);
              setVersao((v) => v + 1);
              await recarregar();
            }}
          />
        )}
      </Gaveta>

      <Gaveta
        aberta={localizandoEm !== null}
        titulo={`Localização · ${localizandoEm?.nome ?? ""}`}
        descricao="Sem a localização, a praça não é detectada nas rotas e o reembolso fica pendente."
        aoFechar={() => setLocalizandoEm(null)}
      >
        {localizandoEm && (
          <LocalizacaoForm
            praca={localizandoEm}
            aoConcluir={async () => {
              setResultado(`Localização de ${localizandoEm.nome} atualizada.`);
              setLocalizandoEm(null);
              await recarregar();
            }}
          />
        )}
      </Gaveta>
    </Pagina>
  );
}
