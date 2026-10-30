import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alerta } from "../../../../shared/components/Alerta";
import { mensagemDeErro } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { confirmarEtiqueta, lerEtiqueta } from "../services/bagagensService";
import type { BagagemEncontrada } from "../types";
import { aeroportoInicial } from "../utils/aeroportoInicial";
import { CampoAeroporto } from "./CampoAeroporto";
import { CapturaFoto } from "./CapturaFoto";
import { DescartarRascunho } from "./DescartarRascunho";
import { FotoBagagem } from "./FotoBagagem";
import { TelaRegistro } from "./TelaRegistro";

/** Passo 2 (HU34, RI21): conferir os dados lidos, o aeroporto e registrar - ou descartar a leitura. */
function Conferencia({ bagagem }: { bagagem: BagagemEncontrada }) {
  const uid = useId();
  const t = useTextos().companhia.bagagens;
  const navigate = useNavigate();
  const [campos, setCampos] = useState({
    numeroEtiqueta: bagagem.lido.numeroEtiqueta ?? "",
    companhia: bagagem.lido.companhia ?? "",
    destino: bagagem.lido.destino ?? "",
    voo: bagagem.lido.voo ?? "",
    nomePassageiro: bagagem.lido.nomePassageiro ?? "",
  });
  const [aeroporto, setAeroporto] = useState(aeroportoInicial(bagagem));
  const [erro, setErro] = useState<string | null>(null);
  const [registrando, setRegistrando] = useState(false);

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
      <CampoAeroporto bagagem={bagagem} valor={aeroporto} aoMudar={setAeroporto} />

      <button type="submit" className="grande bloco" disabled={!campos.numeroEtiqueta.trim() || !aeroporto || registrando}>
        {registrando ? t.registrando : t.registrar}
      </button>
      <DescartarRascunho id={bagagem.id} />
    </form>
  );
}

/** Registro de bagagem encontrada pela foto da etiqueta (HU34): captura em `/companhia/registrar`, conferência em `/companhia/registrar/:id`. */
export function TelaRegistrarEtiqueta() {
  const t = useTextos().companhia.bagagens;
  return (
    <TelaRegistro
      tituloCaptura={t.tituloCaptura}
      tituloConferencia={t.tituloConferencia}
      falhaCarregar={t.falhaRegistrar}
      captura={
        <CapturaFoto
          instrucao={t.instrucao}
          tirarFoto={t.tirarFoto}
          lendo={t.lendo}
          falha={t.falhaLer}
          enviar={lerEtiqueta}
          destino={(rascunho) => `/companhia/registrar/${rascunho.id}`}
        />
      }
      conferencia={(bagagem) => <Conferencia key={bagagem.id} bagagem={bagagem} />}
    />
  );
}
