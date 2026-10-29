import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alerta } from "../../../../shared/components/Alerta";
import { mensagemDeErro } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { descreverBagagem, lerSemEtiqueta } from "../services/bagagensService";
import type { BagagemEncontrada, CorBagagem, SinalParticular, TamanhoBagagem, TipoVolume } from "../types";
import { aeroportoInicial } from "../utils/aeroportoInicial";
import { CORES, SINAIS, TAMANHOS, TIPOS_VOLUME } from "../utils/opcoesDescricao";
import { CampoAeroporto } from "./CampoAeroporto";
import { CapturaFoto } from "./CapturaFoto";
import { DescartarRascunho } from "./DescartarRascunho";
import { FotoBagagem } from "./FotoBagagem";
import { TelaRegistro } from "./TelaRegistro";

/** Passo 2 (HU35, RI22): descrever a bagagem com toques - tipo, tamanho, cor, sinais - e registrar com o código SID. */
function Descricao({ bagagem }: { bagagem: BagagemEncontrada }) {
  const uid = useId();
  const t = useTextos().companhia.semEtiqueta;
  const navigate = useNavigate();
  const [tipoVolume, setTipoVolume] = useState<TipoVolume | null>(null);
  const [tamanho, setTamanho] = useState<TamanhoBagagem | null>(null);
  const [cor, setCor] = useState<CorBagagem | null>(bagagem.lido.cor ?? null);
  const [sinais, setSinais] = useState<SinalParticular[]>([]);
  const [marca, setMarca] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [aeroporto, setAeroporto] = useState(aeroportoInicial(bagagem));
  const [erro, setErro] = useState<string | null>(null);
  const [registrando, setRegistrando] = useState(false);
  const completo = tipoVolume && tamanho && cor && aeroporto;

  const alternarSinal = (sinal: SinalParticular) =>
    setSinais((atuais) => (atuais.includes(sinal) ? atuais.filter((s) => s !== sinal) : [...atuais, sinal]));

  async function registrar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!tipoVolume || !tamanho || !cor || !aeroporto) {
      return;
    }
    setErro(null);
    setRegistrando(true);
    try {
      const registrada = await descreverBagagem(bagagem.id, {
        tipoVolume,
        tamanho,
        cor,
        sinais,
        marca: marca.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
        aeroportoCodigo: aeroporto,
      });
      navigate(`/companhia/bagagens/${registrada.id}/etiqueta`, {
        replace: true,
        state: { aviso: t.etiqueta.registrada(registrada.descricao?.codigoSid ?? "") },
      });
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaRegistrar));
      setRegistrando(false);
    }
  }

  return (
    <form onSubmit={registrar} className="formulario">
      <FotoBagagem bagagem={bagagem} alt={t.fotoAlt} />
      {erro && <Alerta tipo="erro">{erro}</Alerta>}

      <fieldset className="escolhas escolhas-grade">
        <legend>{t.tipo}</legend>
        {TIPOS_VOLUME.map((opcao) => (
          <label key={opcao} className="escolha">
            <input type="radio" name={`${uid}-tipo`} checked={tipoVolume === opcao} onChange={() => setTipoVolume(opcao)} />
            <span>{t.tipos[opcao]}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="escolhas escolhas-grade escolhas-3">
        <legend>{t.tamanho}</legend>
        {TAMANHOS.map((opcao) => (
          <label key={opcao} className="escolha">
            <input type="radio" name={`${uid}-tamanho`} checked={tamanho === opcao} onChange={() => setTamanho(opcao)} />
            <span>
              <strong>{t.tamanhos[opcao]}</strong>
              <span className="texto-apoio em-bloco">{t.tamanhosAjuda[opcao]}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <fieldset className="escolhas escolhas-grade">
        <legend>{t.cor}</legend>
        {!bagagem.lido.cor && <Alerta tipo="info">{t.semSugestao}</Alerta>}
        {CORES.map((opcao) => (
          <label key={opcao} className="escolha">
            <input type="radio" name={`${uid}-cor`} checked={cor === opcao} onChange={() => setCor(opcao)} />
            <span className="amostra-cor" data-cor={opcao} aria-hidden="true" />
            <span>
              {t.cores[opcao]}
              {bagagem.lido.cor === opcao && <span className="texto-apoio em-bloco">{t.sugeridaPelaFoto}</span>}
            </span>
          </label>
        ))}
      </fieldset>

      <fieldset className="escolhas escolhas-grade" aria-describedby={`${uid}-sinais-ajuda`}>
        <legend>{t.sinais}</legend>
        <span id={`${uid}-sinais-ajuda`} className="texto-apoio escolhas-ajuda">
          {t.sinaisAjuda}
        </span>
        {SINAIS.map((opcao) => (
          <label key={opcao} className="escolha">
            <input type="checkbox" checked={sinais.includes(opcao)} onChange={() => alternarSinal(opcao)} />
            <span>{t.sinaisOpcoes[opcao]}</span>
          </label>
        ))}
      </fieldset>

      <div>
        <label htmlFor={`${uid}-marca`}>{t.marca}</label>
        <input
          id={`${uid}-marca`}
          maxLength={60}
          autoComplete="off"
          value={marca}
          onChange={(e) => setMarca(e.target.value)}
          aria-describedby={`${uid}-marca-ajuda`}
        />
        <span id={`${uid}-marca-ajuda`} className="texto-apoio">
          {t.marcaAjuda}
        </span>
      </div>
      <div>
        <label htmlFor={`${uid}-observacoes`}>{t.observacoes}</label>
        <textarea
          id={`${uid}-observacoes`}
          rows={3}
          maxLength={500}
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          aria-describedby={`${uid}-observacoes-ajuda`}
        />
        <span id={`${uid}-observacoes-ajuda`} className="texto-apoio">
          {t.observacoesAjuda}
        </span>
      </div>

      <CampoAeroporto bagagem={bagagem} valor={aeroporto} aoMudar={setAeroporto} />

      {!completo && (
        <p id={`${uid}-faltam`} className="texto-apoio">
          {t.faltam}
        </p>
      )}
      <button
        type="submit"
        className="grande bloco"
        disabled={!completo || registrando}
        aria-describedby={completo ? undefined : `${uid}-faltam`}
      >
        {registrando ? t.registrando : t.registrar}
      </button>
      <DescartarRascunho id={bagagem.id} />
    </form>
  );
}

/** Registro de bagagem sem etiqueta (HU35): captura em `/companhia/sem-etiqueta`, descrição em `/companhia/sem-etiqueta/:id`. */
export function TelaRegistrarSemEtiqueta() {
  const t = useTextos().companhia.semEtiqueta;
  return (
    <TelaRegistro
      tituloCaptura={t.tituloCaptura}
      tituloConferencia={t.tituloDescricao}
      falhaCarregar={t.falhaRegistrar}
      captura={
        <CapturaFoto
          instrucao={t.instrucao}
          tirarFoto={t.tirarFoto}
          lendo={t.lendo}
          falha={t.falhaLer}
          enviar={lerSemEtiqueta}
          destino={(rascunho) => `/companhia/sem-etiqueta/${rascunho.id}`}
        />
      }
      conferencia={(bagagem) => <Descricao key={bagagem.id} bagagem={bagagem} />}
    />
  );
}
