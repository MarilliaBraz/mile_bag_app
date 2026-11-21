import { useEffect, useRef, useState, type FormEvent } from "react";
import { formatarDataHora, mensagemDeErro } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Alerta } from "../../../../shared/components/Alerta";
import { ConfirmarAcao } from "../../../../shared/components/ConfirmarAcao";
import type { BdoResponse, CamposBdo } from "../../../../shared/types/bdo";
import { buscarBdosPorNumero, incluirBdo, lerTextoBdo } from "../services/entregasService";

const TAMANHO_MAXIMO_TEXTO = 20000;

const VAZIO: CamposBdo = {
  numero: null,
  passageiroNome: null,
  enderecoEntrega: null,
  companhiaAerea: null,
  telefonePassageiro: null,
  emailPassageiro: null,
  etiquetaBagagem: null,
  tipoProcesso: null,
  cidade: null,
  uf: null,
  cep: null,
  instrucoesEntrega: null,
  aeroportoRetirada: null,
  vooChegada: null,
  dataEntregaPrevista: null,
  quantidadeMalas: null,
  coresBagagem: null,
  valorInformado: null,
};

type CampoTexto = Exclude<keyof CamposBdo, "quantidadeMalas">;

/** Como o servidor compara o número: sem diferenciar maiúsculas nem espaços. */
const normalizarNumero = (numero: string | null) => (numero ?? "").replace(/\s+/g, "").toUpperCase();

/**
 * Inclusão do BDO pela empresa (V49). O caminho mais curto é colar o texto do telex (o mesmo que chega por e-mail):
 * o sistema preenche os campos e a empresa confere. Também dá para digitar tudo. Se o número já existir, pergunta
 * antes de incluir de novo. O BDO entra nos disponíveis e os motoristas são avisados; o passageiro não.
 */
/** Mescla o que o texto trouxe sobre o que já estava no formulário: o que o texto não tem não apaga o digitado. */
function mesclar(atuais: CamposBdo, lidos: CamposBdo): CamposBdo {
  const resultado = { ...atuais };
  for (const chave of Object.keys(lidos) as Array<keyof CamposBdo>) {
    if (lidos[chave] !== null && lidos[chave] !== "") {
      (resultado as Record<keyof CamposBdo, unknown>)[chave] = lidos[chave];
    }
  }
  return resultado;
}

export function IncluirBdo({
  aoIncluir,
  aoMudarEstado,
}: {
  aoIncluir: (numero: string) => void;
  /** Quem abriu a gaveta pergunta antes de descartar o preenchido e não fecha durante o envio. */
  aoMudarEstado: (estado: { preenchido: boolean; ocupado: boolean }) => void;
}) {
  const textos = useTextos();
  const t = textos.backOffice.entregas.incluir;
  const [texto, setTexto] = useState("");
  const [campos, setCampos] = useState<CamposBdo>(VAZIO);
  const [lendo, setLendo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [repetido, setRepetido] = useState(false);
  // O estado "enviando" só chega no próximo render: a ref segura um Enter repetido no meio.
  const emVoo = useRef(false);
  // Número repetido: conferido assim que o número é conhecido (texto lido ou campo deixado), não só ao incluir.
  const [repetidos, setRepetidos] = useState<{ numero: string; bdos: BdoResponse[] } | null>(null);
  const numeroAtual = normalizarNumero(campos.numero);
  const repetidosDoNumero = repetidos && repetidos.numero === numeroAtual && repetidos.bdos.length > 0 ? repetidos.bdos : null;
  const preenchido = texto.trim() !== "" || Object.values(campos).some((valor) => valor !== null && valor !== "");
  const ocupado = lendo || enviando;

  useEffect(() => {
    aoMudarEstado({ preenchido, ocupado });
  }, [preenchido, ocupado, aoMudarEstado]);

  async function verificarNumero(numero: string | null) {
    const normalizado = normalizarNumero(numero);
    if (!normalizado) {
      setRepetidos(null);
      return;
    }
    try {
      setRepetidos({ numero: normalizado, bdos: await buscarBdosPorNumero(normalizado) });
    } catch {
      // O alerta é uma ajuda: sem ele, a inclusão ainda confere o número antes de gravar.
      setRepetidos(null);
    }
  }

  async function ler() {
    setLendo(true);
    setErro(null);
    setAviso(null);
    try {
      const lidos = await lerTextoBdo(texto);
      setCampos((atuais) => mesclar(atuais, lidos));
      setAviso(lidos.numero || lidos.passageiroNome || lidos.enderecoEntrega ? t.lidoConfira : t.nadaLido);
      if (lidos.numero) {
        void verificarNumero(lidos.numero);
      }
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaLer));
    } finally {
      setLendo(false);
    }
  }

  async function conferirRepetido(evento: FormEvent) {
    evento.preventDefault();
    if (emVoo.current) {
      return;
    }
    const numero = campos.numero?.trim() ?? "";
    if (!numero) {
      setErro(t.numeroObrigatorio);
      return;
    }
    setErro(null);
    emVoo.current = true;
    setEnviando(true);
    try {
      const existentes = await buscarBdosPorNumero(numero);
      setRepetidos({ numero: normalizarNumero(numero), bdos: existentes });
      if (existentes.length > 0) {
        setRepetido(true);
        return;
      }
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaIncluir));
      return;
    } finally {
      emVoo.current = false;
      setEnviando(false);
    }
    await salvar();
  }

  async function salvar() {
    if (emVoo.current) {
      return;
    }
    emVoo.current = true;
    setErro(null);
    setEnviando(true);
    try {
      const incluido = await incluirBdo({ ...campos, numero: campos.numero?.trim() ?? null }, texto.trim() || null);
      setRepetido(false);
      aoIncluir(incluido.campos.numero ?? campos.numero ?? "");
    } catch (excecao) {
      setRepetido(false);
      setErro(mensagemDeErro(excecao, t.falhaIncluir));
    } finally {
      emVoo.current = false;
      setEnviando(false);
    }
  }

  const alterar = (id: CampoTexto, valor: string) => setCampos((atual) => ({ ...atual, [id]: valor || null }));

  function campo(
    id: CampoTexto,
    rotulo: string,
    extra: { obrigatorio?: boolean; maximo?: number; tipo?: string; aoSair?: () => void } = {},
  ) {
    return (
      <div>
        <label htmlFor={`bdo-${id}`}>
          {rotulo}
          {extra.obrigatorio && <span aria-hidden="true"> *</span>}
        </label>
        <input
          id={`bdo-${id}`}
          type={extra.tipo ?? "text"}
          required={extra.obrigatorio}
          maxLength={extra.maximo}
          value={campos[id] ?? ""}
          onChange={(evento) => alterar(id, evento.target.value)}
          onBlur={extra.aoSair}
        />
      </div>
    );
  }

  return (
    <div className="pilha">
      <section className="pilha" aria-labelledby="bdo-colar-titulo">
        <h3 id="bdo-colar-titulo">{t.colarTitulo}</h3>
        <label htmlFor="bdo-texto" className="texto-apoio m-0">
          {t.colarDescricao}
        </label>
        <textarea
          id="bdo-texto"
          rows={8}
          maxLength={TAMANHO_MAXIMO_TEXTO}
          spellCheck={false}
          className="texto-telex"
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
        />
        <div>
          <button type="button" className="secundario" disabled={!texto.trim() || lendo || enviando} onClick={() => void ler()}>
            {lendo ? t.lendo : t.ler}
          </button>
        </div>
      </section>

      {aviso && <Alerta tipo="info">{aviso}</Alerta>}

      <form className="pilha divisor-topo" onSubmit={(evento) => void conferirRepetido(evento)} aria-labelledby="bdo-campos-titulo">
        <h3 id="bdo-campos-titulo">{t.camposTitulo}</h3>
        <p className="texto-apoio m-0">{t.camposDescricao}</p>

        {/* Enquanto o texto é lido, os campos ficam travados: a resposta chegaria por cima do que fosse digitado. */}
        <fieldset className="pilha sem-moldura" disabled={lendo}>
          <div className="form-linha">
            {campo("numero", t.numero, { obrigatorio: true, maximo: 30, aoSair: () => void verificarNumero(campos.numero) })}
            {campo("companhiaAerea", t.companhia, { maximo: 100 })}
          </div>
          {repetidosDoNumero && (
            <Alerta tipo="aviso">
              <strong>{t.repetidoAlerta(campos.numero?.trim() ?? "", repetidosDoNumero.length)}</strong>
              <ul className="m-0">
                {repetidosDoNumero.map((bdo) => (
                  <li key={bdo.id}>
                    {t.repetidoItem(
                      bdo.campos.passageiroNome ?? "—",
                      formatarDataHora(bdo.dataCaptura),
                      textos.backOffice.entregas.origens[bdo.origem] ?? bdo.origem,
                    )}
                  </li>
                ))}
              </ul>
            </Alerta>
          )}
          <div className="form-linha">{campo("passageiroNome", t.passageiro, { obrigatorio: true, maximo: 200 })}</div>
          <div className="form-linha">{campo("enderecoEntrega", t.endereco, { obrigatorio: true, maximo: 300 })}</div>
          <div className="form-linha">
            {campo("cidade", t.cidade, { maximo: 100 })}
            {campo("uf", t.uf, { maximo: 2 })}
            {campo("cep", t.cep, { maximo: 9 })}
          </div>
          <div className="form-linha">
            {campo("telefonePassageiro", t.telefone, { maximo: 30, tipo: "tel" })}
            {campo("emailPassageiro", t.email, { maximo: 200, tipo: "email" })}
          </div>
          <div className="form-linha">
            {campo("etiquetaBagagem", t.etiquetas, { maximo: 300 })}
            <div>
              <label htmlFor="bdo-quantidadeMalas">{t.quantidadeMalas}</label>
              <input
                id="bdo-quantidadeMalas"
                type="number"
                inputMode="numeric"
                min={1}
                max={20}
                value={campos.quantidadeMalas ?? ""}
                onChange={(evento) =>
                  setCampos((atual) => ({ ...atual, quantidadeMalas: evento.target.value ? Number(evento.target.value) : null }))
                }
              />
            </div>
            {campo("coresBagagem", t.cores, { maximo: 200 })}
          </div>
          <div className="form-linha">
            {campo("aeroportoRetirada", t.aeroporto, { maximo: 3 })}
            {campo("vooChegada", t.voo, { maximo: 20 })}
            {campo("dataEntregaPrevista", t.dataPrevista, { tipo: "date" })}
          </div>
          <div>
            <label htmlFor="bdo-instrucoesEntrega">{t.instrucoes}</label>
            <textarea
              id="bdo-instrucoesEntrega"
              rows={2}
              maxLength={2000}
              value={campos.instrucoesEntrega ?? ""}
              onChange={(evento) => alterar("instrucoesEntrega", evento.target.value)}
            />
          </div>
          {campos.valorInformado && <p className="texto-apoio m-0">{t.valorInformado(campos.valorInformado)}</p>}
        </fieldset>

        {/* Perto do botão: no celular, com a gaveta rolada até aqui, a falha fica à vista. */}
        {erro && <Alerta tipo="erro">{erro}</Alerta>}

        <div>
          <button type="submit" disabled={enviando || lendo}>
            {enviando ? t.incluindo : t.incluir}
          </button>
        </div>
      </form>

      <ConfirmarAcao
        aberto={repetido}
        titulo={t.repetidoTitulo(campos.numero ?? "")}
        descricao={t.repetidoDescricao}
        rotuloConfirmar={t.repetidoConfirmar}
        rotuloDesistir={textos.comum.voltar}
        ocupado={enviando}
        aoConfirmar={() => void salvar()}
        aoCancelar={() => setRepetido(false)}
      />
    </div>
  );
}
