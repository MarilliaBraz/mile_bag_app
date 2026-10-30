import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Alerta, Carregando, Vazio } from "../../../../shared/components/Alerta";
import { BotaoSair } from "../../../../shared/components/BotaoSair";
import { Icone } from "../../../../shared/components/Icone";
import { SeletorIdioma } from "../../../../shared/components/SeletorIdioma";
import { useRecurso } from "../../../../shared/hooks/useRecurso";
import { formatarDataHora } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { listarRascunhos, listarRecentes } from "../services/bagagensService";
import type { BagagemEncontrada } from "../types";

/** Rascunho volta à conferência do seu tipo (HU34, HU35). */
const conferenciaDo = (b: BagagemEncontrada) =>
  b.tipo === "SEM_ETIQUETA" ? `/companhia/sem-etiqueta/${b.id}` : `/companhia/registrar/${b.id}`;

/** Início do funcionário da companhia aérea (HU33-HU35): registrar bagagem, rascunhos por conferir e registros recentes. */
export function TelaInicioCompanhia() {
  const textos = useTextos();
  const t = textos.companhia.inicio;
  const sem = textos.companhia.semEtiqueta;
  const [aviso, setAviso] = useState<string | null>((useLocation().state as { aviso?: string } | null)?.aviso ?? null);
  const { dados: rascunhos } = useRecurso(listarRascunhos, t.falhaCarregar);
  const { dados: recentes, erro, carregando } = useRecurso(listarRecentes, t.falhaCarregar);

  return (
    <div className="tela-entrada tela-companhia">
      <main className="pilha">
        <div className="entrada-idioma">
          <SeletorIdioma />
        </div>
        <p className="marca">{t.area}</p>
        <h1>{t.titulo}</h1>
        {aviso && (
          <Alerta tipo="sucesso" aoFechar={() => setAviso(null)}>
            {aviso}
          </Alerta>
        )}

        <Link to="/companhia/registrar" className="cartao-link destaque-acao">
          <Icone nome="camera" />
          <span className="cartao-corpo">
            <strong>{t.registrarComEtiqueta}</strong>
            <span className="texto-apoio em-bloco">{t.registrarComEtiquetaAjuda}</span>
          </span>
          <Icone nome="chevron" />
        </Link>
        <Link to="/companhia/sem-etiqueta" className="cartao-link destaque-acao">
          <Icone nome="mala" />
          <span className="cartao-corpo">
            <strong>{t.registrarSemEtiqueta}</strong>
            <span className="texto-apoio em-bloco">{t.registrarSemEtiquetaAjuda}</span>
          </span>
          <Icone nome="chevron" />
        </Link>

        {rascunhos && rascunhos.length > 0 && (
          <section className="pilha">
            <h2>{t.rascunhos}</h2>
            <p className="texto-apoio">{t.rascunhosAjuda}</p>
            <ul className="lista">
              {rascunhos.map((b) => (
                <li key={b.id}>
                  <Link to={conferenciaDo(b)} className="cartao-link">
                    <Icone nome="lapis" />
                    <span className="cartao-corpo">
                      <strong>{b.tipo === "SEM_ETIQUETA" ? t.semEtiqueta : (b.lido.numeroEtiqueta ?? t.semNumero)}</strong>
                      <span className="texto-apoio em-bloco">{formatarDataHora(b.criadoEm)}</span>
                    </span>
                    <Icone nome="chevron" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="pilha">
          <h2>{t.recentes}</h2>
          {erro && <Alerta tipo="erro">{erro}</Alerta>}
          {carregando && <Carregando />}
          {recentes && recentes.length === 0 && <Vazio icone="mala" titulo={t.nenhumRecente} />}
          {recentes && recentes.length > 0 && (
            <ul className="lista">
              {recentes.map((b) => {
                const autoria = (
                  <span className="texto-apoio em-bloco">
                    {textos.companhia.bagagens.registradaPor(b.registradoPor ?? "", formatarDataHora(b.registradaEm ?? b.criadoEm))}
                  </span>
                );
                const aeroporto = b.aeroporto && <span className="selo selo-info">{b.aeroporto.codigo}</span>;
                // Sem etiqueta (HU35): pelo código SID, com tipo e cor, e reabre a etiqueta para imprimir.
                return b.descricao ? (
                  <li key={b.id}>
                    <Link to={`/companhia/bagagens/${b.id}/etiqueta`} className="cartao-link">
                      <Icone nome="mala" />
                      <span className="cartao-corpo">
                        <strong className="mono">{b.descricao.codigoSid}</strong> {aeroporto}
                        <span className="em-bloco">{sem.resumo(sem.tipos[b.descricao.tipoVolume], sem.cores[b.descricao.cor])}</span>
                        {autoria}
                      </span>
                      <Icone nome="chevron" />
                    </Link>
                  </li>
                ) : (
                  <li key={b.id} className="cartao cartao-corpo">
                    <strong className="mono">{b.etiqueta?.numeroEtiqueta}</strong> {aeroporto}
                    {autoria}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <Link to="/conta/senha" className="cartao-link">
          <Icone nome="chave" />
          <span className="cartao-corpo">
            <strong>{textos.menu.minhaSenha}</strong>
          </span>
          <Icone nome="chevron" />
        </Link>
        <BotaoSair className="perigo-contorno grande bloco" />
      </main>
    </div>
  );
}
