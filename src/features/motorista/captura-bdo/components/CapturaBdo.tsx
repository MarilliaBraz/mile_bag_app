import { Ajuda } from "../../../../shared/ui/Ajuda";
import { useState } from "react";
import { ApiError } from "../../../../shared/api/ApiError";
import { arquivoParaBase64, enfileirar } from "../../offline-sync/fila";
import { Link } from "react-router-dom";
import { Alerta, Carregando } from "../../../../shared/ui/Alerta";
import { AvisoContatoIncompleto } from "../../../../shared/ui/AvisoContatoIncompleto";
import { Icone } from "../../../../shared/ui/Icone";
import { TelaMotorista } from "../../layout/TelaMotorista";
import { avaliarCompletudeContato } from "../completudeContato";
import { capturarBdo, confirmarConferencia } from "../services/bdoService";
import type { BdoResponse, CamposExtraidosBdo } from "../types";

type Etapa = "captura" | "conferencia" | "enviando" | "concluido" | "enfileirado";

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
 */
export function CapturaBdo() {
  const [etapa, setEtapa] = useState<Etapa>("captura");
  const [bdo, setBdo] = useState<BdoResponse | null>(null);
  const [campos, setCampos] = useState<CamposExtraidosBdo>(CAMPO_VAZIO);
  const [erro, setErro] = useState<string | null>(null);

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

  function recomecar() {
    setBdo(null);
    setCampos(CAMPO_VAZIO);
    setEtapa("captura");
  }

  if (etapa === "concluido") {
    return (
      <TelaMotorista titulo="BDO confirmado" navegacao>
        <div className="vazio" role="status">
          <Icone nome="checkCirculo" />
          <strong>BDO {campos.numero} confirmado</strong>
          <span>Ele já está disponível para ser assumido no painel de entregas.</span>
        </div>
        <div className="pilha mt-4">
          <Link to="/motorista" className="botao grande bloco">
            Ir para minhas entregas
          </Link>
          <button type="button" className="secundario grande bloco" onClick={recomecar}>
            <Icone nome="camera" /> Capturar outro BDO
          </button>
        </div>
      </TelaMotorista>
    );
  }

  if (etapa === "enfileirado") {
    return (
      <TelaMotorista titulo="Foto salva no aparelho" navegacao>
        <Alerta tipo="aviso">
          Sem conexão agora: a foto do BDO foi salva e será enviada automaticamente quando houver rede. A conferência dos campos ficará
          disponível depois que o servidor processar a imagem.
        </Alerta>
        <button type="button" className="grande bloco" onClick={() => setEtapa("captura")}>
          <Icone nome="camera" /> Capturar outro BDO
        </button>
      </TelaMotorista>
    );
  }

  return (
    <TelaMotorista titulo={etapa === "conferencia" ? "Conferir dados do BDO" : "Capturar BDO"} navegacao>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}

      {etapa === "captura" && (
        <>
          <p className="texto-apoio">Fotografe o documento do BDO. O sistema lê os campos, e você confere tudo antes de confirmar.</p>
          <label className="seletor-foto" style={{ padding: "3rem 1rem" }}>
            <Icone nome="camera" />
            <strong>Fotografar BDO</strong>
            <span>Documento inteiro, bem iluminado e sem reflexo.</span>
            <input id="foto-bdo" className="visualmente-oculto" type="file" accept="image/*" capture="environment" onChange={aoSelecionarFoto} />
          </label>
        </>
      )}

      {etapa === "enviando" && <Carregando texto="Lendo o documento…" />}

      {etapa === "conferencia" && bdo && (
        <form onSubmit={confirmar}>
          <Alerta tipo="info">Confira os campos lidos automaticamente e corrija o que estiver errado. Nada é salvo sem a sua confirmação.</Alerta>

          <div className="cartao formulario">
            <CampoTexto label="Número do BDO" valor={campos.numero} aoAlterar={(v) => atualizarCampo("numero", v)} obrigatorio />
            <CampoTexto label="Nome do passageiro" valor={campos.passageiroNome} aoAlterar={(v) => atualizarCampo("passageiroNome", v)} obrigatorio />
            <CampoTexto label="Endereço de entrega" valor={campos.enderecoEntrega} aoAlterar={(v) => atualizarCampo("enderecoEntrega", v)} obrigatorio />
            <CampoTexto label="Companhia aérea" valor={campos.companhiaAerea} aoAlterar={(v) => atualizarCampo("companhiaAerea", v)} />
            <CampoTexto label="Telefone do passageiro" tipo="tel" valor={campos.telefonePassageiro} aoAlterar={(v) => atualizarCampo("telefonePassageiro", v)} />
            <CampoTexto label="E-mail do passageiro" tipo="email" valor={campos.emailPassageiro} aoAlterar={(v) => atualizarCampo("emailPassageiro", v)} />
            <CampoTexto label="Etiqueta da bagagem" valor={campos.etiquetaBagagem} aoAlterar={(v) => atualizarCampo("etiquetaBagagem", v)} />
          </div>

          {/* RN15/HU28: só avisa, não impede confirmar - acompanha a correção dos campos. */}
          <AvisoContatoIncompleto pendencias={avaliarCompletudeContato(campos.enderecoEntrega ?? "", campos.telefonePassageiro ?? "")} />

          <div className="acao-fixa">
            <button type="submit" className="grande bloco">
              <Icone nome="check" /> Confirmar BDO
            </button>
          </div>
        </form>
      )}

      <Ajuda>
        <p>Fotografe o documento do BDO. O sistema lê os campos, e você confere e corrige tudo antes de confirmar. Nada é salvo sem a sua conferência.</p>
      </Ajuda>
    </TelaMotorista>
  );
}

function CampoTexto({
  label,
  valor,
  aoAlterar,
  obrigatorio = false,
  tipo = "text",
}: {
  label: string;
  valor: string | null;
  aoAlterar: (valor: string) => void;
  obrigatorio?: boolean;
  tipo?: "text" | "tel" | "email";
}) {
  const id = `campo-${label.toLowerCase().replace(/\W+/g, "-")}`;
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
      <input id={id} type={tipo} value={valor ?? ""} onChange={(evento) => aoAlterar(evento.target.value)} required={obrigatorio} aria-required={obrigatorio} />
    </div>
  );
}
function mensagemDeErro(excecao: unknown): string {
  if (excecao instanceof ApiError) {
    return excecao.message;
  }
  return "Não foi possível concluir a operação. Tente novamente.";
}
