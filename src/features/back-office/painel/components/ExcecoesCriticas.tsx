import { CartaoIndicador } from "../../../../shared/components/CartaoIndicador";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import type { PainelGestao } from "../types";
import type { AbrirLista } from "./PulsoOperacao";

/** Exceções críticas: o que deu problema e pede ação agora. Cada número abre a lista das malas. */
export function ExcecoesCriticas({
  painel,
  bdosSemMotorista,
  emergencias,
  abrirLista,
}: {
  painel: PainelGestao;
  bdosSemMotorista: number;
  emergencias: number;
  abrirLista: AbrirLista;
}) {
  const t = useTextos().backOffice.painel;
  const { tentativasFrustradas, paradas, evidenciasPendentes, avarias } = painel.excecoes;
  return (
    <section className="secao-painel pilha" aria-labelledby="excecoes-titulo">
      <div>
        <h2 id="excecoes-titulo">{t.excecoes}</h2>
        <p className="texto-apoio">{t.excecoesDescricao}</p>
      </div>
      <div className="indicadores">
        <CartaoIndicador rotulo={t.emergencias} valor={emergencias} tom="erro" para="/admin/emergencias" />
        <CartaoIndicador
          rotulo={t.bdosPendentes}
          valor={bdosSemMotorista}
          detalhe={t.bdosPendentesAjuda}
          tom="erro"
          para="/admin/entregas"
        />
        <CartaoIndicador
          rotulo={t.tentativasFrustradas}
          valor={tentativasFrustradas.length}
          detalhe={t.tentativasFrustradasAjuda}
          tom="erro"
          aoClicar={() => abrirLista(t.tentativasFrustradas, tentativasFrustradas, "referencia")}
        />
        <CartaoIndicador
          rotulo={t.paradas}
          valor={paradas.length}
          detalhe={t.paradasAjuda(painel.horasSemAtualizacao)}
          tom="erro"
          aoClicar={() => abrirLista(t.paradas, paradas, "referencia")}
        />
        <CartaoIndicador
          rotulo={t.evidencias}
          valor={evidenciasPendentes.length}
          detalhe={t.evidenciasAjuda}
          tom="aviso"
          aoClicar={() => abrirLista(t.evidencias, evidenciasPendentes, "referencia")}
        />
        <CartaoIndicador
          rotulo={t.avarias}
          valor={avarias.naRetirada + avarias.naEntrega}
          detalhe={t.avariasAjuda(avarias.naRetirada, avarias.naEntrega)}
          tom="aviso"
          aoClicar={() => abrirLista(t.avarias, avarias.itens, "referencia")}
        />
      </div>
    </section>
  );
}
