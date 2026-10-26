import { obterTextos, useTextos } from "../../../../shared/i18n/idioma";
import { Ajuda } from "../../../../shared/ui/Ajuda";
import { useEffect, useState } from "react";
import { ApiError } from "../../../../shared/api/ApiError";
import { arquivoParaBase64, enfileirar } from "../../offline-sync/fila";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alerta, Carregando } from "../../../../shared/ui/Alerta";
import { AvisoContatoIncompleto } from "../../../../shared/ui/AvisoContatoIncompleto";
import { Icone } from "../../../../shared/ui/Icone";
import { TelaMotorista } from "../../layout/TelaMotorista";
import { avaliarCompletudeContato } from "../completudeContato";
import { capturarBdo, confirmarConferencia, descartarCaptura } from "../services/bdoService";
import type { BdoResponse, CamposExtraidosBdo } from "../types";

type Etapa = "captura" | "conferencia" | "enviando" | "concluido" | "enfileirado";

/** Vindo do painel ("Fotos de BDO para conferir"): abre direto a conferência de uma captura já enviada. */
export type EstadoCapturaBdo = { bdoParaConferir?: BdoResponse };

const CAMPO_VAZIO: CamposExtraidosBdo = {
  numero: "",
  passageiroNome: "",
  enderecoEntrega: "",
  companhiaAerea: "",
  telefonePassageiro: "",
  emailPassageiro: "",
  etiquetaBagagem: "",
};

/**
 * Fluxo completo de HU01: fotografar o BDO, revisar/corrigir os campos que
 * o OCR extraiu e confirmar - nunca grava automaticamente a partir do OCR
 * (FR-003). Numero, passageiroNome e enderecoEntrega sao os campos que
 * BdoService.confirmarConferencia exige (os demais podem ficar vazios).
 *
 * <p>A captura já cria o BDO como pendente no servidor (com a foto). Ele só
 * entra na lista de disponíveis depois da confirmação; se o motorista
 * descartar ou tirar outra foto, a captura anterior é apagada.</p>
 */
export function CapturaBdo() {
  const localizacao = useLocation();
  const navegar = useNavigate();
  const [paraConferir] = useState(() => (localizacao.state as EstadoCapturaBdo | null)?.bdoParaConferir ?? null);
  const [etapa, setEtapa] = useState<Etapa>(paraConferir ? "conferencia" : "captura");
  const [bdo, setBdo] = useState<BdoResponse | null>(paraConferir);
  const [campos, setCampos] = useState<CamposExtraidosBdo>({ ...CAMPO_VAZIO, ...paraConferir?.camposExtraidos });
  const [erro, setErro] = useState<string | null>(null);
  const t = useTextos().motorista.captura;

  // A captura já foi copiada para o estado: limpa a da navegação para recarregar a página não reabrir uma conferência já concluída.
  useEffect(() => {
    if (localizacao.state) {
      navegar(localizacao.pathname, { replace: true, state: null });
    }
  }, [localizacao, navegar]);

  async function aoSelecionarFoto(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) {
      return;
    }
    setErro(null);
    setEtapa("enviando");
    try {
      const resposta = await capturarBdo(arquivo);
      setBdo(resposta);
      setCampos({ ...CAMPO_VAZIO, ...resposta.camposExtraidos });
      setEtapa("conferencia");
    } catch (excecao) {
      // Offline (HU08, FR-001): a foto vai para a fila e o OCR roda no
      // servidor na sincronização - a conferência dos campos (FR-003 de
      // HU01) só pode acontecer depois, porque depende desse resultado.
      if (!(excecao instanceof ApiError)) {
        await enfileirar("BDO_CAPTURADO", { imagemBase64: await arquivoParaBase64(arquivo), nomeArquivo: arquivo.name });
        setEtapa("enfileirado");
        return;
      }
      setErro(mensagemDeErro(excecao));
      setEtapa("captura");
    }
  }

  async function confirmar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!bdo) {
      return;
    }
    setErro(null);
    setEtapa("enviando");
    try {
      await confirmarConferencia(bdo.id, campos);
      setEtapa("concluido");
    } catch (excecao) {
      setErro(mensagemDeErro(excecao));
      setEtapa("conferencia");
    }
  }

  function atualizarCampo(nome: keyof CamposExtraidosBdo, valor: string) {
    setCampos((atual) => ({ ...atual, [nome]: valor }));
  }

  /** Apaga a captura pendente no servidor; se falhar (ex.: sem rede), ela segue pendente e nunca vira entrega. */
  async function descartarEFotografarDeNovo() {
    const pendente = bdo;
    recomecar();
    if (pendente) {
      await descartarCaptura(pendente.id).catch(() => undefined);
    }
  }

  function recomecar() {
    setBdo(null);
    setCampos(CAMPO_VAZIO);
    setEtapa("captura");
  }

  if (etapa === "concluido") {
    return (
      <TelaMotorista titulo={t.bdoConfirmado} navegacao>
        <div className="vazio" role="status">
          <Icone nome="checkCirculo" />
          <strong>{t.bdoNumeroConfirmado(campos.numero ?? "")}</strong>
          <span>{t.disponivelPainel}</span>
        </div>
        <div className="pilha mt-4">
          <Link to="/motorista" className="botao grande bloco">
            {t.irParaEntregas}
          </Link>
          <button type="button" className="secundario grande bloco" onClick={recomecar}>
            <Icone nome="camera" /> {t.capturarOutro}
          </button>
        </div>
      </TelaMotorista>
    );
  }

  if (etapa === "enfileirado") {
    return (
      <TelaMotorista titulo={t.fotoSalva} navegacao>
        <Alerta tipo="aviso">{t.fotoNaFila}</Alerta>
        <button type="button" className="grande bloco" onClick={() => setEtapa("captura")}>
          <Icone nome="camera" /> {t.capturarOutro}
        </button>
      </TelaMotorista>
    );
  }

  return (
    <TelaMotorista titulo={etapa === "conferencia" ? t.conferirDados : t.capturarBdo} navegacao>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}

      {etapa === "captura" && (
        <>
          <p className="texto-apoio">{t.instrucao}</p>
          <label className="seletor-foto" style={{ padding: "3rem 1rem" }}>
            <Icone nome="camera" />
            <strong>{t.fotografar}</strong>
            <span>{t.dicaFoto}</span>
            <input
              id="foto-bdo"
              className="visualmente-oculto"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={aoSelecionarFoto}
            />
          </label>
        </>
      )}

      {etapa === "enviando" && <Carregando texto={t.lendo} />}

      {etapa === "conferencia" && bdo && (
        <form onSubmit={confirmar}>
          <Alerta tipo="info">{t.confiraCampos}</Alerta>

          <div className="cartao formulario">
            <CampoTexto id="numero" label={t.numero} valor={campos.numero} aoAlterar={(v) => atualizarCampo("numero", v)} obrigatorio />
            <CampoTexto
              id="passageiro"
              label={t.passageiro}
              valor={campos.passageiroNome}
              aoAlterar={(v) => atualizarCampo("passageiroNome", v)}
              obrigatorio
            />
            <CampoTexto
              id="endereco"
              label={t.endereco}
              valor={campos.enderecoEntrega}
              aoAlterar={(v) => atualizarCampo("enderecoEntrega", v)}
              obrigatorio
            />
            <CampoTexto
              id="companhia"
              label={t.companhia}
              valor={campos.companhiaAerea}
              aoAlterar={(v) => atualizarCampo("companhiaAerea", v)}
            />
            <CampoTexto
              id="telefone"
              label={t.telefone}
              tipo="tel"
              valor={campos.telefonePassageiro}
              aoAlterar={(v) => atualizarCampo("telefonePassageiro", v)}
            />
            <CampoTexto
              id="email"
              label={t.email}
              tipo="email"
              valor={campos.emailPassageiro}
              aoAlterar={(v) => atualizarCampo("emailPassageiro", v)}
            />
            <CampoTexto
              id="etiqueta"
              label={t.etiqueta}
              valor={campos.etiquetaBagagem}
              aoAlterar={(v) => atualizarCampo("etiquetaBagagem", v)}
            />
          </div>

          {/* RN15/HU28: só avisa, não impede confirmar - acompanha a correção dos campos. */}
          <AvisoContatoIncompleto pendencias={avaliarCompletudeContato(campos.enderecoEntrega ?? "", campos.telefonePassageiro ?? "")} />

          <div className="acao-fixa">
            <button type="submit" className="grande bloco">
              <Icone nome="check" /> {t.confirmar}
            </button>
            <button type="button" className="secundario bloco mt-2" onClick={descartarEFotografarDeNovo}>
              <Icone nome="camera" /> {t.descartar}
            </button>
          </div>
        </form>
      )}

      <Ajuda>
        <p>{t.ajuda}</p>
      </Ajuda>
    </TelaMotorista>
  );
}

function CampoTexto({
  id: nome,
  label,
  valor,
  aoAlterar,
  obrigatorio = false,
  tipo = "text",
}: {
  id: string;
  label: string;
  valor: string | null;
  aoAlterar: (valor: string) => void;
  obrigatorio?: boolean;
  tipo?: "text" | "tel" | "email";
}) {
  const id = `campo-${nome}`;
  return (
    <div>
      <label htmlFor={id}>
        {label}
        {obrigatorio && (
          <span className="campo-obrigatorio" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      <input
        id={id}
        type={tipo}
        value={valor ?? ""}
        onChange={(evento) => aoAlterar(evento.target.value)}
        required={obrigatorio}
        aria-required={obrigatorio}
      />
    </div>
  );
}
function mensagemDeErro(excecao: unknown): string {
  if (excecao instanceof ApiError) {
    return excecao.message;
  }
  return obterTextos().motorista.captura.falha;
}
