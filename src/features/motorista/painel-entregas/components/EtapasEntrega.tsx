import { useTextos } from "../../../../shared/i18n/idioma";
import { Icone, type NomeIcone } from "../../../../shared/ui/Icone";
import type { ItemPainel } from "../types";

const ETAPAS: { rotulo: "assumida" | "aCaminho" | "noEndereco" | "entregue"; icone: NomeIcone }[] = [
  { rotulo: "assumida", icone: "mala" },
  { rotulo: "aCaminho", icone: "carro" },
  { rotulo: "noEndereco", icone: "pino" },
  { rotulo: "entregue", icone: "checkCirculo" },
];

/** Etapa em que a entrega está agora, a partir do status e do marco mais recente (RF19). Entregue = todas concluídas. */
function etapaAtual(entrega: Pick<ItemPainel, "status" | "marcoMaisRecente" | "temTrajetoIniciado">): number {
  if (entrega.status === "ENCERRADA_COM_SUCESSO") {
    return ETAPAS.length;
  }
  if (entrega.marcoMaisRecente === "CHEGADA") {
    return 2;
  }
  if (entrega.marcoMaisRecente === "A_CAMINHO" || entrega.temTrajetoIniciado || entrega.status === "EM_ANDAMENTO") {
    return 1;
  }
  return 0;
}

/**
 * Andamento da entrega em quatro etapas (diretrizes de IHC, seção 3:
 * processo com mais de uma etapa mostra em qual o usuário está e quantas
 * faltam). Cada etapa tem ícone e rótulo; a cor só reforça.
 */
export function EtapasEntrega({ entrega }: { entrega: Pick<ItemPainel, "status" | "marcoMaisRecente" | "temTrajetoIniciado"> }) {
  const atual = etapaAtual(entrega);
  const t = useTextos().motorista.etapas;
  return (
    <ol className="etapas" aria-label={atual >= ETAPAS.length ? t.concluida : t.etapaDe(atual + 1, ETAPAS.length)}>
      {ETAPAS.map((etapa, indice) => {
        const feita = indice < atual;
        const classe = feita ? "etapa-feita" : indice === atual ? "etapa-atual" : undefined;
        return (
          <li key={etapa.rotulo} className={classe} aria-current={indice === atual ? "step" : undefined}>
            <span className="etapa-marca">
              <Icone nome={feita ? "check" : etapa.icone} />
            </span>
            {t[etapa.rotulo]}
            <span className="visualmente-oculto">{feita ? t.feita : indice === atual ? t.atual : t.aFazer}</span>
          </li>
        );
      })}
    </ol>
  );
}
