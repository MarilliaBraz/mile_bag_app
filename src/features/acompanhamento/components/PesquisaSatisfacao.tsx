import { useState } from "react";
import { Alerta } from "../../../shared/components/Alerta";
import { mensagemDeErro } from "../../../shared/utils/formatar";
import { useTextos } from "../../../shared/utils/i18n/idioma";
import { avaliarEntrega } from "../services/acompanhamentoService";

const NOTAS = Array.from({ length: 11 }, (_, i) => i);
const ESTRELAS = [1, 2, 3, 4, 5];

/** V65: pesquisa de satisfação do passageiro, na página "Acompanhe sua bagagem", depois da entrega. Uma por entrega. */
export function PesquisaSatisfacao({ codigo, avaliada }: { codigo: string; avaliada: boolean }) {
  const t = useTextos().acompanhamento.pesquisa;
  const [nota, setNota] = useState<number | null>(null);
  const [cordialidade, setCordialidade] = useState<number | null>(null);
  const [bomEstado, setBomEstado] = useState<boolean | null>(null);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(avaliada);
  const [erro, setErro] = useState<string | null>(null);

  if (enviada) {
    return (
      <section className="cartao">
        <p className="cartao-titulo">{t.obrigado}</p>
      </section>
    );
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (nota === null) return;
    setEnviando(true);
    setErro(null);
    try {
      await avaliarEntrega(codigo, {
        nota,
        cordialidade: cordialidade ?? undefined,
        malaEmBomEstado: bomEstado ?? undefined,
        comentario: comentario.trim() || undefined,
      });
      setEnviada(true);
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falha));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="cartao pilha pesquisa" onSubmit={enviar}>
      <h2 className="cartao-titulo">{t.titulo}</h2>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      <fieldset>
        <legend>{t.nota}</legend>
        <div className="escala-nota">
          {NOTAS.map((valor) => (
            <button
              key={valor}
              type="button"
              className={nota === valor ? "selecionado" : undefined}
              aria-pressed={nota === valor}
              aria-label={t.notaValor(valor)}
              onClick={() => setNota(valor)}
            >
              {valor}
            </button>
          ))}
        </div>
        <div className="escala-legenda texto-apoio">
          <span>{t.poucoProvavel}</span>
          <span>{t.muitoProvavel}</span>
        </div>
      </fieldset>
      <fieldset>
        <legend>{t.cordialidade}</legend>
        <div className="escala-estrelas">
          {ESTRELAS.map((valor) => (
            <button
              key={valor}
              type="button"
              className={cordialidade !== null && valor <= cordialidade ? "selecionado" : undefined}
              aria-pressed={cordialidade === valor}
              aria-label={t.estrelas(valor)}
              onClick={() => setCordialidade(valor)}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>{t.estadoMala}</legend>
        <div className="segmentado">
          <button type="button" aria-pressed={bomEstado === true} onClick={() => setBomEstado(true)}>
            {t.sim}
          </button>
          <button type="button" aria-pressed={bomEstado === false} onClick={() => setBomEstado(false)}>
            {t.nao}
          </button>
        </div>
      </fieldset>
      <div>
        <label htmlFor="comentario-pesquisa">{t.comentario}</label>
        <textarea id="comentario-pesquisa" rows={3} maxLength={500} value={comentario} onChange={(e) => setComentario(e.target.value)} />
      </div>
      <button type="submit" className="bloco" disabled={nota === null || enviando}>
        {enviando ? t.enviando : t.enviar}
      </button>
    </form>
  );
}
