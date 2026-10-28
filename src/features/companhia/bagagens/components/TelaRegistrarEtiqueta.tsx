import { useEffect, useId, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alerta, Carregando } from "../../../../shared/components/Alerta";
import { ConfirmarAcao } from "../../../../shared/components/ConfirmarAcao";
import { Icone } from "../../../../shared/components/Icone";
import { useRecurso } from "../../../../shared/hooks/useRecurso";
import { mensagemDeErro } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { obterPosicaoAtual } from "../../../../shared/utils/posicaoAtual";
import { buscarBagagem, confirmarEtiqueta, descartarBagagem, lerEtiqueta, listarAeroportos } from "../services/bagagensService";
import type { BagagemEncontrada } from "../types";
import { formatarDistancia } from "../utils/formatarDistancia";
import { FotoBagagem } from "./FotoBagagem";

/** Passo 1 (HU34, RI21): a foto da etiqueta e, junto, a posição do celular. */
function Captura() {
  const t = useTextos().companhia.bagagens;
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(foto: File | undefined) {
    if (!foto) {
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      // A posição é pedida junto: se a foto não trouxer GPS, vale a do celular.
      const posicao = await obterPosicaoAtual(8_000);
      const rascunho = await lerEtiqueta(foto, posicao);
      navigate(`/companhia/registrar/${rascunho.id}`, { replace: true });
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaLer));
      setEnviando(false);
    }
  }

  return (
    <>
      <p>{t.instrucao}</p>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {enviando ? (
        <Carregando texto={t.lendo} />
      ) : (
        <label className="botao grande bloco">
          <Icone nome="camera" /> {t.tirarFoto}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="visualmente-oculto"
            onChange={(evento) => enviar(evento.target.files?.[0])}
          />
        </label>
      )}
    </>
  );
}

/** Passo 2 (HU34, RI21): conferir os dados lidos, o aeroporto e registrar - ou descartar a leitura. */
function Conferencia({ bagagem }: { bagagem: BagagemEncontrada }) {
  const uid = useId();
  const t = useTextos().companhia.bagagens;
  const navigate = useNavigate();
  const { dados: aeroportos } = useRecurso(listarAeroportos, t.falhaRegistrar);
  const [campos, setCampos] = useState({
    numeroEtiqueta: bagagem.lido.numeroEtiqueta ?? "",
    companhia: bagagem.lido.companhia ?? "",
    destino: bagagem.lido.destino ?? "",
    voo: bagagem.lido.voo ?? "",
    nomePassageiro: bagagem.lido.nomePassageiro ?? "",
  });
  const [aeroporto, setAeroporto] = useState(bagagem.aeroporto && !bagagem.aeroporto.distante ? bagagem.aeroporto.codigo : "");
  const [erro, setErro] = useState<string | null>(null);
  const [registrando, setRegistrando] = useState(false);
  const [descartando, setDescartando] = useState(false);

  const campo = (nome: keyof typeof campos, rotulo: string, ajuda?: string) => (
    <div>
      <label htmlFor={`${uid}-${nome}`}>
        {rotulo}
        {!bagagem.lido[nome] && <span className="texto-apoio"> · {t.naoLido}</span>}
      </label>
      <input
        id={`${uid}-${nome}`}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        value={campos[nome]}
        onChange={(e) => setCampos({ ...campos, [nome]: e.target.value })}
        aria-describedby={ajuda ? `${uid}-${nome}-ajuda` : undefined}
      />
      {ajuda && (
        <span id={`${uid}-${nome}-ajuda`} className="texto-apoio">
          {ajuda}
        </span>
      )}
    </div>
  );

  async function registrar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setRegistrando(true);
    try {
      const vazioVira = (valor: string) => (valor.trim() ? valor.trim() : undefined);
      const registrada = await confirmarEtiqueta(bagagem.id, {
        numeroEtiqueta: campos.numeroEtiqueta.trim(),
        companhia: vazioVira(campos.companhia),
        destino: vazioVira(campos.destino),
        voo: vazioVira(campos.voo),
        nomePassageiro: vazioVira(campos.nomePassageiro),
        aeroportoCodigo: aeroporto,
      });
      navigate("/companhia/inicio", { state: { aviso: t.registrada(registrada.etiqueta?.numeroEtiqueta ?? "") } });
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaRegistrar));
      setRegistrando(false);
    }
  }

  return (
    <form onSubmit={registrar} className="formulario">
      <FotoBagagem bagagem={bagagem} alt={t.fotoAlt} />
      <Alerta tipo={bagagem.lido.origemLeitura === "NENHUMA" ? "aviso" : "info"}>{t.leitura[bagagem.lido.origemLeitura]}</Alerta>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {campo("numeroEtiqueta", t.numeroEtiqueta, t.numeroAjuda)}
      <div className="grade-campos">
        {campo("companhia", t.companhia)}
        {campo("destino", t.destino)}
        {campo("voo", t.voo)}
      </div>
      {campo("nomePassageiro", t.nomePassageiro)}

      <div>
        <label htmlFor={`${uid}-aeroporto`}>{t.aeroporto}</label>
        <select id={`${uid}-aeroporto`} value={aeroporto} onChange={(e) => setAeroporto(e.target.value)} aria-describedby={`${uid}-local`}>
          <option value="">{t.escolhaAeroporto}</option>
          {aeroportos?.map((a) => (
            <option key={a.codigo} value={a.codigo}>
              {a.codigo} · {a.cidade}/{a.uf} · {a.nome}
            </option>
          ))}
        </select>
        <span id={`${uid}-local`} className="texto-apoio">
          {t.localizacao[bagagem.localizacao.origem]}{" "}
          {bagagem.aeroporto?.distanciaMetros !== undefined &&
            t.sugerido(bagagem.aeroporto.codigo, formatarDistancia(bagagem.aeroporto.distanciaMetros))}
        </span>
      </div>
      {bagagem.aeroporto?.distante && <Alerta tipo="aviso">{t.distante}</Alerta>}

      <button type="submit" className="grande bloco" disabled={!campos.numeroEtiqueta.trim() || !aeroporto || registrando}>
        {registrando ? t.registrando : t.registrar}
      </button>
      <button type="button" className="perigo-contorno bloco" onClick={() => setDescartando(true)}>
        {t.descartar}
      </button>
      <ConfirmarAcao
        aberto={descartando}
        titulo={t.descartarTitulo}
        descricao={t.descartarDescricao}
        rotuloConfirmar={t.descartar}
        perigo
        aoConfirmar={async () => {
          await descartarBagagem(bagagem.id).catch(() => undefined);
          navigate("/companhia/inicio", { replace: true });
        }}
        aoCancelar={() => setDescartando(false)}
      />
    </form>
  );
}

/** Registro de bagagem encontrada pela foto da etiqueta (HU34): captura em `/companhia/registrar`, conferência em `/companhia/registrar/:id`. */
export function TelaRegistrarEtiqueta() {
  const t = useTextos().companhia.bagagens;
  const { id } = useParams();
  const [bagagem, setBagagem] = useState<BagagemEncontrada | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    buscarBagagem(id)
      .then(setBagagem)
      .catch((excecao) => setErro(mensagemDeErro(excecao, t.falhaRegistrar)));
  }, [id, t.falhaRegistrar]);

  return (
    <div className="tela-entrada tela-companhia">
      <main className="pilha">
        <Link to="/companhia/inicio" className="texto-apoio">
          <Icone nome="voltar" /> {t.voltar}
        </Link>
        <h1>{id ? t.tituloConferencia : t.tituloCaptura}</h1>
        {!id && <Captura />}
        {id && erro && <Alerta tipo="erro">{erro}</Alerta>}
        {id && !bagagem && !erro && <Carregando />}
        {bagagem && <Conferencia key={bagagem.id} bagagem={bagagem} />}
      </main>
    </div>
  );
}
