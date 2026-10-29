import { useId, useState } from "react";
import { Alerta, Carregando } from "../../../../shared/components/Alerta";
import { ConfirmarAcao } from "../../../../shared/components/ConfirmarAcao";
import { Icone } from "../../../../shared/components/Icone";
import { Gaveta, Painel } from "../../../../shared/components/Pagina";
import { useRecurso } from "../../../../shared/hooks/useRecurso";
import { formatarDataHora, mensagemDeErro } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { cancelarEncaminhamento, encaminharBagagem, listarEmpresasEntrega } from "../services/bagagensService";
import type { BagagemEncontrada, EmpresaEntrega } from "../types";
import { classeEtapa } from "../utils/etapaEntrega";

const PROCESSO = /^[A-Z0-9]{4,30}$/;

function FormularioEncaminhamento({
  bagagem,
  empresas,
  aoEncaminhar,
}: {
  bagagem: BagagemEncontrada;
  empresas: EmpresaEntrega[];
  aoEncaminhar: (atualizada: BagagemEncontrada, empresa: string) => void;
}) {
  const uid = useId();
  const t = useTextos().companhia.encaminhamento;
  const [empresaId, setEmpresaId] = useState(empresas.length === 1 ? empresas[0].id : "");
  const [processo, setProcesso] = useState("");
  const [passageiro, setPassageiro] = useState(bagagem.etiqueta?.nomePassageiro ?? "");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const pronto = empresaId && PROCESSO.test(processo) && passageiro.trim() && endereco.trim() && (!email.trim() || email.includes("@"));

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const atualizada = await encaminharBagagem(bagagem.id, {
        empresaId,
        numeroProcesso: processo,
        passageiroNome: passageiro.trim(),
        endereco: endereco.trim(),
        telefone: telefone.trim() || undefined,
        email: email.trim() || undefined,
      });
      aoEncaminhar(atualizada, empresas.find((e) => e.id === empresaId)?.nome ?? "");
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaEncaminhar));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="formulario">
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      <div>
        <label htmlFor={`${uid}-empresa`}>{t.empresa}</label>
        <select id={`${uid}-empresa`} value={empresaId} onChange={(e) => setEmpresaId(e.target.value)}>
          <option value="">{t.escolha}</option>
          {empresas.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`${uid}-processo`}>{t.processo}</label>
        <input
          id={`${uid}-processo`}
          className="mono"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={30}
          value={processo}
          onChange={(e) => setProcesso(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
          aria-describedby={`${uid}-processo-ajuda`}
        />
        <span id={`${uid}-processo-ajuda`} className="texto-apoio">
          {t.processoAjuda}
        </span>
      </div>
      <div>
        <label htmlFor={`${uid}-passageiro`}>{t.passageiro}</label>
        <input
          id={`${uid}-passageiro`}
          autoComplete="off"
          maxLength={200}
          value={passageiro}
          onChange={(e) => setPassageiro(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor={`${uid}-endereco`}>{t.endereco}</label>
        <textarea id={`${uid}-endereco`} rows={3} maxLength={300} value={endereco} onChange={(e) => setEndereco(e.target.value)} />
      </div>
      <div>
        <label htmlFor={`${uid}-telefone`}>{t.telefone}</label>
        <input
          id={`${uid}-telefone`}
          type="tel"
          autoComplete="off"
          maxLength={30}
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor={`${uid}-email`}>{t.email}</label>
        <input
          id={`${uid}-email`}
          type="email"
          autoComplete="off"
          maxLength={200}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby={`${uid}-email-ajuda`}
        />
        <span id={`${uid}-email-ajuda`} className="texto-apoio">
          {t.emailAjuda}
        </span>
      </div>
      <button type="submit" className="bloco" disabled={!pronto || enviando}>
        {enviando ? t.encaminhando : t.encaminhar}
      </button>
    </form>
  );
}

/** A gaveta só busca as parceiras quando abre. */
function GavetaEncaminhar({
  bagagem,
  aoFechar,
  aoEncaminhar,
}: {
  bagagem: BagagemEncontrada;
  aoFechar: () => void;
  aoEncaminhar: (atualizada: BagagemEncontrada, empresa: string) => void;
}) {
  const t = useTextos().companhia.encaminhamento;
  const { dados: empresas, erro, carregando } = useRecurso(listarEmpresasEntrega, t.falhaEncaminhar);
  return (
    <Gaveta aberta titulo={t.encaminhar} aoFechar={aoFechar}>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {carregando && <Carregando />}
      {empresas && empresas.length === 0 && <Alerta tipo="aviso">{t.semParceira}</Alerta>}
      {empresas && empresas.length > 0 && <FormularioEncaminhamento bagagem={bagagem} empresas={empresas} aoEncaminhar={aoEncaminhar} />}
    </Gaveta>
  );
}

/** Botão para encaminhar a bagagem registrada (HU37, RI24); abre a gaveta com o formulário. */
export function BotaoEncaminhar({
  bagagem,
  aoAtualizar,
}: {
  bagagem: BagagemEncontrada;
  aoAtualizar: (b: BagagemEncontrada, aviso: string) => void;
}) {
  const t = useTextos().companhia.encaminhamento;
  const [aberta, setAberta] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setAberta(true)}>
        <Icone nome="caminhao" /> {t.encaminhar}
      </button>
      {aberta && (
        <GavetaEncaminhar
          bagagem={bagagem}
          aoFechar={() => setAberta(false)}
          aoEncaminhar={(atualizada, empresa) => {
            setAberta(false);
            aoAtualizar(atualizada, t.encaminhada(empresa));
          }}
        />
      )}
    </>
  );
}

/** Quadro "Entrega" da bagagem encaminhada (HU37, RI24): empresa, processo, passageiro, etapa e cancelamento. */
export function PainelEntrega({ bagagem, aoCancelar }: { bagagem: BagagemEncontrada; aoCancelar: (aviso: string) => void }) {
  const textos = useTextos().companhia;
  const t = textos.encaminhamento;
  const [confirmando, setConfirmando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const e = bagagem.encaminhamento;
  if (!e) {
    return null;
  }

  async function cancelar() {
    setCancelando(true);
    setErro(null);
    try {
      await cancelarEncaminhamento(bagagem.id);
      setConfirmando(false);
      aoCancelar(t.cancelado);
    } catch (excecao) {
      setConfirmando(false);
      setErro(mensagemDeErro(excecao, t.falhaCancelar));
    } finally {
      setCancelando(false);
    }
  }

  return (
    <Painel titulo={t.entrega}>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      <p>
        <span className={classeEtapa(e.etapa)}>{t.etapas[e.etapa]}</span>
        <span className="texto-apoio em-bloco">{t.etapaAjuda[e.etapa]}</span>
      </p>
      <dl className="dados-grade">
        <div>
          <dt>{t.empresa}</dt>
          <dd>{e.empresa}</dd>
        </div>
        <div>
          <dt>{t.processo}</dt>
          <dd className="mono">{e.numeroProcesso}</dd>
        </div>
        <div>
          <dt>{t.passageiro}</dt>
          <dd>{e.passageiroNome}</dd>
        </div>
        <div>
          <dt>{t.endereco}</dt>
          <dd>{e.endereco}</dd>
        </div>
        <div>
          <dt>{t.encaminhadaPor}</dt>
          <dd>{e.encaminhadoPor ?? textos.ficha.vazio}</dd>
        </div>
        <div>
          <dt>{t.encaminhadaEm}</dt>
          <dd>{formatarDataHora(e.encaminhadoEm)}</dd>
        </div>
        <div>
          <dt>{t.atualizadaEm}</dt>
          <dd>{formatarDataHora(e.atualizadoEm)}</dd>
        </div>
      </dl>
      {e.etapa === "AGUARDANDO_MOTORISTA" && (
        <button type="button" className="secundario" onClick={() => setConfirmando(true)} disabled={cancelando}>
          {cancelando ? t.cancelando : t.cancelar}
        </button>
      )}
      <ConfirmarAcao
        aberto={confirmando}
        titulo={t.cancelar}
        descricao={t.confirmarCancelar}
        rotuloConfirmar={t.cancelar}
        perigo
        ocupado={cancelando}
        aoConfirmar={cancelar}
        aoCancelar={() => setConfirmando(false)}
      />
    </Painel>
  );
}
