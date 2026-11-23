import { useId, useRef, useState, type FormEvent } from "react";
import { mensagemDeErro } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Alerta } from "../../../../shared/components/Alerta";
import type { DadosPassageiroBdo } from "../../../../shared/types/bdo";
import { alterarDadosPassageiro, consultarDadosPassageiro } from "../services/entregasService";
import { CamposPassageiroBdo, type CampoPassageiro } from "./CamposPassageiroBdo";
import type { EntregaGestao } from "../types";

const TAMANHO_MAXIMO_MOTIVO = 500;

/**
 * V59: corrigir nome, endereço, telefone e e-mail do passageiro até a entrega ser concluída (ex.: o passageiro ligou
 * mudando o endereço). Motivo obrigatório; o antes e o depois ficam no histórico da mala, e o motorista que está com a
 * entrega é avisado.
 */
export function AlterarDadosBdo({ linha, aoAlterar }: { linha: EntregaGestao; aoAlterar: () => void }) {
  const uid = useId();
  const t = useTextos().backOffice.entregas.alterarDados;
  const [dados, setDados] = useState<DadosPassageiroBdo | null>(null);
  const [motivo, setMotivo] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  // O estado "enviando" só chega no próximo render: a ref segura um Enter repetido no meio.
  const emVoo = useRef(false);

  async function abrir() {
    setCarregando(true);
    setErro(null);
    try {
      setDados(await consultarDadosPassageiro(linha.bdoId));
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaCarregar));
    } finally {
      setCarregando(false);
    }
  }

  function fechar() {
    setDados(null);
    setMotivo("");
    setErro(null);
  }

  const alterar = (campo: CampoPassageiro, valor: string) => setDados((atual) => (atual ? { ...atual, [campo]: valor || null } : atual));

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    if (!dados || emVoo.current) {
      return;
    }
    emVoo.current = true;
    setEnviando(true);
    setErro(null);
    try {
      await alterarDadosPassageiro(linha.bdoId, dados, motivo.trim());
      aoAlterar();
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falha));
    } finally {
      emVoo.current = false;
      setEnviando(false);
    }
  }

  return (
    <section className="pilha divisor-topo" aria-labelledby={`${uid}-titulo`}>
      <h3 id={`${uid}-titulo`}>{t.titulo}</h3>
      <p className="texto-apoio m-0">{t.descricao}</p>
      {!dados && (
        <>
          {erro && <Alerta tipo="erro">{erro}</Alerta>}
          <div>
            <button type="button" className="secundario" disabled={carregando} onClick={() => void abrir()}>
              {carregando ? t.carregando : t.abrir}
            </button>
          </div>
        </>
      )}
      {dados && (
        <form className="pilha" onSubmit={(evento) => void salvar(evento)}>
          <fieldset className="pilha sem-moldura" disabled={enviando}>
            <CamposPassageiroBdo valores={dados} alterar={alterar} prefixo={`${uid}-dados`} />
            <div>
              <label htmlFor={`${uid}-motivo`}>
                {t.motivo}
                <span aria-hidden="true"> *</span>
              </label>
              <textarea
                id={`${uid}-motivo`}
                required
                rows={2}
                maxLength={TAMANHO_MAXIMO_MOTIVO}
                value={motivo}
                onChange={(evento) => setMotivo(evento.target.value)}
              />
            </div>
          </fieldset>
          {/* Perto dos botões: no celular, com a gaveta rolada até aqui, a falha fica à vista. */}
          {erro && <Alerta tipo="erro">{erro}</Alerta>}
          <div className="acoes-linha">
            <button type="submit" disabled={!motivo.trim() || enviando}>
              {enviando ? t.salvando : t.salvar}
            </button>
            <button type="button" className="secundario" disabled={enviando} onClick={fechar}>
              {t.desistir}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
