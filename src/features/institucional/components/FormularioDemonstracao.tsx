import { useEffect, useRef, useState, type FormEvent } from "react";
import { ApiError } from "../../../shared/services/ApiError";
import { useTextos } from "../../../shared/utils/i18n/idioma";
import { linkWhatsApp } from "../constantes";
import { pedirDemonstracao } from "../services/demonstracaoService";
import type { PerfilCliente } from "../types";

type Situacao = { tipo: "editando" } | { tipo: "enviando" } | { tipo: "enviado" } | { tipo: "erro"; mensagem: string };

/**
 * Pedido de demonstração (HU38). Nunca diz "enviado" sem a API confirmar: em qualquer falha mostra o motivo e o
 * WhatsApp. O campo "site" é a isca para robôs e fica fora da tela e da navegação por teclado.
 */
export function FormularioDemonstracao() {
  const t = useTextos().institucional;
  const td = t.demonstracao;
  const [situacao, setSituacao] = useState<Situacao>({ tipo: "editando" });
  const abertoEm = useRef(0);

  useEffect(() => {
    abertoEm.current = Date.now();
  }, []);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    const texto = (campo: string) => String(dados.get(campo) ?? "").trim();
    setSituacao({ tipo: "enviando" });
    try {
      await pedirDemonstracao({
        nome: texto("nome"),
        empresa: texto("empresa"),
        perfil: texto("perfil") as PerfilCliente,
        email: texto("email"),
        telefone: texto("telefone") || undefined,
        mensagem: texto("mensagem") || undefined,
        consentimento: dados.get("consentimento") === "on",
        site: texto("site"),
        preenchidoEmMs: Date.now() - abertoEm.current,
      });
      setSituacao({ tipo: "enviado" });
    } catch (excecao) {
      setSituacao({ tipo: "erro", mensagem: mensagemDaFalha(excecao, td) });
    }
  }

  const whatsapp = (
    <a href={linkWhatsApp(t.mensagemWhatsapp)} target="_blank" rel="noopener noreferrer" className="inst-botao inst-botao-whatsapp">
      {t.whatsapp}
    </a>
  );

  if (situacao.tipo === "enviado") {
    return (
      <div className="inst-retorno inst-retorno-sucesso" role="status">
        <p>
          <strong>{td.sucesso}</strong>
        </p>
        <p>{td.sucessoWhatsapp}</p>
        {whatsapp}
      </div>
    );
  }

  const enviando = situacao.tipo === "enviando";
  return (
    <form className="inst-formulario" onSubmit={enviar}>
      {situacao.tipo === "erro" && (
        <div className="inst-retorno inst-retorno-erro" role="alert">
          <p>
            <strong>{td.falha}</strong> {situacao.mensagem}
          </p>
          {whatsapp}
        </div>
      )}
      <label>
        {td.nome}
        <input name="nome" required minLength={2} maxLength={100} autoComplete="name" />
      </label>
      <label>
        {td.empresa}
        <input name="empresa" required minLength={2} maxLength={120} autoComplete="organization" />
      </label>
      <label>
        {td.perfil}
        <select name="perfil" required defaultValue="EMPRESA_ENTREGA">
          <option value="EMPRESA_ENTREGA">{td.perfilEmpresa}</option>
          <option value="COMPANHIA_AEREA">{td.perfilCompanhia}</option>
        </select>
      </label>
      <label>
        {td.email}
        <input name="email" type="email" required maxLength={254} autoComplete="email" />
      </label>
      <label>
        {td.telefone}
        <input name="telefone" type="tel" maxLength={30} pattern="[0-9+\(\)\- ]*" autoComplete="tel" />
      </label>
      <label>
        {td.mensagem}
        <textarea name="mensagem" maxLength={2000} />
      </label>
      <div className="inst-isca" aria-hidden="true">
        <label>
          Site
          <input name="site" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="inst-consentimento">
        <input name="consentimento" type="checkbox" required />
        <span>{td.consentimento}</span>
      </label>
      <button type="submit" className="inst-botao inst-botao-destaque inst-botao-grande" disabled={enviando}>
        {enviando ? td.enviando : td.enviar}
      </button>
      <p className="inst-ou">{td.ou}</p>
      {whatsapp}
    </form>
  );
}

/** 429 e 503 têm texto próprio em cada idioma; a validação (400) usa a explicação da API. */
function mensagemDaFalha(excecao: unknown, td: { limite: string; indisponivel: string }): string {
  if (excecao instanceof ApiError) {
    if (excecao.status === 429) {
      return td.limite;
    }
    if (excecao.status >= 500) {
      return td.indisponivel;
    }
    return excecao.message;
  }
  return td.indisponivel;
}
