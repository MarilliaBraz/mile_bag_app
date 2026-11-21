import { useState, type FormEvent } from "react";
import { mensagemDeErro } from "../utils/formatar";
import { useTextos } from "../utils/i18n/idioma";
import { Alerta } from "./Alerta";
import { Icone } from "./Icone";

/** No celular, a folha de compartilhar do sistema já oferece "Imprimir" e os apps; no computador, abre o PDF numa aba. */
function compartilhaArquivos(): boolean {
  try {
    const teste = new File([""], "teste.pdf", { type: "application/pdf" });
    return window.matchMedia("(pointer: coarse)").matches && !!navigator.canShare?.({ files: [teste] });
  } catch {
    return false;
  }
}

/**
 * Segunda via do BDO (V50), usada pelo motorista (detalhe da entrega) e pela empresa (gaveta da mala): imprimir o
 * PDF ou enviá-lo por e-mail para imprimir onde houver impressora. O PDF é gerado na hora pela API e não fica salvo.
 */
export function SegundaViaBdo({
  nomeArquivo,
  baixar,
  enviar,
}: {
  nomeArquivo: string;
  baixar: () => Promise<Blob>;
  enviar: (email: string) => Promise<unknown>;
}) {
  const textos = useTextos();
  const t = textos.segundaVia;
  const [preparando, setPreparando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  async function imprimir() {
    setErro(null);
    setSucesso(null);
    const compartilhar = compartilhaArquivos();
    // A aba abre já no clique: depois da espera do download o navegador a bloquearia como pop-up.
    const aba = compartilhar ? null : window.open("", "_blank");
    setPreparando(true);
    try {
      const pdf = await baixar();
      if (compartilhar) {
        try {
          await navigator.share({ files: [new File([pdf], nomeArquivo, { type: "application/pdf" })], title: nomeArquivo });
          return;
        } catch (excecao) {
          // iOS e alguns Android recusam o compartilhar quando o download demorou (o toque "expirou"): baixa direto.
          if (!(excecao instanceof DOMException && excecao.name === "NotAllowedError")) {
            throw excecao;
          }
        }
      }
      const url = URL.createObjectURL(pdf);
      if (aba) {
        aba.location.href = url;
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = nomeArquivo;
        link.click();
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (excecao) {
      aba?.close();
      // Fechar a folha de compartilhar não é erro.
      if (!(excecao instanceof DOMException && excecao.name === "AbortError")) {
        setErro(mensagemDeErro(excecao, t.falhaImprimir));
      }
    } finally {
      setPreparando(false);
    }
  }

  async function enviarPorEmail(evento: FormEvent) {
    evento.preventDefault();
    if (enviando) {
      return;
    }
    setErro(null);
    setSucesso(null);
    setEnviando(true);
    try {
      const destino = email.trim();
      await enviar(destino);
      setSucesso(t.enviado(destino));
      setEmail("");
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaEnviar));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="pilha" aria-labelledby="segunda-via-titulo">
      <h2 id="segunda-via-titulo" className="m-0">
        <Icone nome="documento" /> {t.titulo}
      </h2>
      <p className="texto-apoio m-0">{t.explicacao}</p>
      <div>
        <button type="button" className="secundario" disabled={preparando} onClick={() => void imprimir()}>
          <Icone nome="impressora" /> {preparando ? t.preparando : t.imprimir}
        </button>
      </div>

      <form className="pilha" onSubmit={(evento) => void enviarPorEmail(evento)}>
        <h3 className="m-0">{t.enviarTitulo}</h3>
        <p className="texto-apoio m-0">{t.enviarDica}</p>
        <div className="form-linha">
          <div>
            <label htmlFor="segunda-via-email">{t.email}</label>
            <input
              id="segunda-via-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              maxLength={200}
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
            />
          </div>
          <button type="submit" disabled={enviando || !email.trim()}>
            {enviando ? textos.comum.enviando : t.enviar}
          </button>
        </div>
        <p className="texto-apoio m-0">{t.privacidade}</p>
      </form>

      {sucesso && <Alerta tipo="sucesso">{sucesso}</Alerta>}
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
    </section>
  );
}
