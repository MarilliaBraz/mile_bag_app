import { CartaoIndicador } from "../../../../shared/components/CartaoIndicador";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import type { AbrirLista, ItemMala, PainelGestao, RotaAtiva } from "../types";

/** Faixa de exceções: cada contador abre a lista completa das malas daquele tipo. */
export function ExcecoesCriticas({ painel, rotas, abrirLista }: { painel: PainelGestao; rotas: RotaAtiva[]; abrirLista: AbrirLista }) {
  const t = useTextos().backOffice.painel;
  const { radar } = painel;
  const { tentativasFrustradas, paradas, evidenciasPendentes, avarias } = painel.excecoes;
  const rotasComAlerta: ItemMala[] = rotas
    .filter((rota) => rota.situacao === "SEM_SINAL" || rota.situacao === "DESVIO")
    .map((rota) => ({
      bdoId: rota.trajetoId,
      entregaId: rota.entregaId,
      numero: rota.numero,
      passageiro: rota.destino,
      base: rota.base,
      motorista: rota.motorista,
      prazo: null,
      referencia: rota.ultimaPosicao,
      detalhe: t.situacoesRota[rota.situacao],
    }));
  return (
    <section className="secao-painel pilha" aria-labelledby="excecoes-titulo">
      <div>
        <h2 id="excecoes-titulo">{t.excecoes}</h2>
        <p className="texto-apoio">{t.excecoesDescricao}</p>
      </div>
      <div className="indicadores">
        <CartaoIndicador
          rotulo={t.atrasadas}
          valor={radar.atrasadas.length}
          tom="erro"
          aoClicar={() => abrirLista(t.atrasadas, radar.atrasadas, "prazo")}
        />
        <CartaoIndicador
          rotulo={t.emAlerta}
          valor={radar.alerta.length}
          detalhe={t.emAlertaAjuda}
          tom="aviso"
          aoClicar={() => abrirLista(t.emAlerta, radar.alerta, "prazo")}
        />
        <CartaoIndicador
          rotulo={t.motivos.SEM_SINAL + " / " + t.motivos.DESVIO.toLowerCase()}
          valor={rotasComAlerta.length}
          tom="erro"
          aoClicar={() => abrirLista(t.rotas, rotasComAlerta, "referencia")}
        />
        <CartaoIndicador
          rotulo={t.paradas}
          valor={paradas.length}
          detalhe={t.paradasAjuda(painel.horasSemAtualizacao)}
          tom="erro"
          aoClicar={() => abrirLista(t.paradas, paradas, "referencia")}
        />
        <CartaoIndicador
          rotulo={t.tentativasFrustradas}
          valor={tentativasFrustradas.length}
          tom="aviso"
          aoClicar={() => abrirLista(t.tentativasFrustradas, tentativasFrustradas, "referencia")}
        />
        <CartaoIndicador
          rotulo={t.evidencias}
          valor={evidenciasPendentes.length}
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
