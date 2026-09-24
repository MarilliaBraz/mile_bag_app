import { useState } from "react";
import { ApiError } from "../../../../shared/api/ApiError";
import { arquivoParaBase64, enfileirar } from "../../offline-sync/fila";
import { IndicadorSincronizacao } from "../../offline-sync/IndicadorSincronizacao";
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

  if (etapa === "concluido") {
    return (
      <main style={{ maxWidth: 480, margin: "2rem auto", padding: "0 1rem" }}>
        <h1>BDO confirmado</h1>
        <p role="status">
          O BDO {campos.numero} foi confirmado e está disponível para autoatribuição.
        </p>
        <button
          onClick={() => {
            setBdo(null);
            setCampos(CAMPO_VAZIO);
            setEtapa("captura");
          }}
        >
          Capturar outro BDO
        </button>
      </main>
    );
  }

  if (etapa === "enfileirado") {
    return (
      <main style={{ maxWidth: 480, margin: "2rem auto", padding: "0 1rem" }}>
        <IndicadorSincronizacao />
        <h1>Foto salva no aparelho</h1>
        <p role="status">
          Sem conexão agora: a foto do BDO foi salva e será enviada automaticamente quando houver rede. A conferência dos campos
          ficará disponível depois que o servidor processar a imagem.
        </p>
        <button onClick={() => setEtapa("captura")}>Capturar outro BDO</button>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 480, margin: "2rem auto", padding: "0 1rem" }}>
      <IndicadorSincronizacao />
      <h1>Capturar BDO</h1>

      {erro && (
        <p role="alert" style={{ color: "var(--erro)" }}>
          {erro}
        </p>
      )}

      {etapa === "captura" && (
        <>
          <label htmlFor="foto-bdo">Fotografia do documento</label>
          <input id="foto-bdo" type="file" accept="image/*" capture="environment" onChange={aoSelecionarFoto} />
        </>
      )}

      {etapa === "enviando" && <p role="status">Processando…</p>}

      {etapa === "conferencia" && bdo && (
        <form onSubmit={confirmar}>
          <p>Revise os campos extraídos automaticamente e corrija o que for necessário antes de confirmar.</p>

          <CampoTexto label="Número do BDO" valor={campos.numero} aoAlterar={(v) => atualizarCampo("numero", v)} obrigatorio />
          <CampoTexto
            label="Nome do passageiro"
            valor={campos.passageiroNome}
            aoAlterar={(v) => atualizarCampo("passageiroNome", v)}
            obrigatorio
          />
          <CampoTexto
            label="Endereço de entrega"
            valor={campos.enderecoEntrega}
            aoAlterar={(v) => atualizarCampo("enderecoEntrega", v)}
            obrigatorio
          />
          <CampoTexto
            label="Companhia aérea"
            valor={campos.companhiaAerea}
            aoAlterar={(v) => atualizarCampo("companhiaAerea", v)}
          />
          <CampoTexto
            label="Telefone do passageiro"
            valor={campos.telefonePassageiro}
            aoAlterar={(v) => atualizarCampo("telefonePassageiro", v)}
          />
          <CampoTexto
            label="E-mail do passageiro"
            valor={campos.emailPassageiro}
            aoAlterar={(v) => atualizarCampo("emailPassageiro", v)}
          />
          <CampoTexto
            label="Etiqueta da bagagem"
            valor={campos.etiquetaBagagem}
            aoAlterar={(v) => atualizarCampo("etiquetaBagagem", v)}
          />

          <button type="submit" style={{ marginTop: "1rem" }}>
            Confirmar BDO
          </button>
        </form>
      )}
    </main>
  );
}

function CampoTexto({
  label,
  valor,
  aoAlterar,
  obrigatorio = false,
}: {
  label: string;
  valor: string | null;
  aoAlterar: (valor: string) => void;
  obrigatorio?: boolean;
}) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label htmlFor={label}>
        {label}
        {obrigatorio ? " *" : ""}
      </label>
      <input
        id={label}
        type="text"
        value={valor ?? ""}
        onChange={(evento) => aoAlterar(evento.target.value)}
        required={obrigatorio}
      />
    </div>
  );
}

function mensagemDeErro(excecao: unknown): string {
  if (excecao instanceof ApiError) {
    return excecao.message;
  }
  return "Não foi possível concluir a operação. Tente novamente.";
}
