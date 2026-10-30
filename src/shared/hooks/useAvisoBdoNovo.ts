import { useEffect, useSyncExternalStore } from "react";
import { requisitar } from "../services/httpClient";
import { sincronizarInscricao } from "../services/notificacoesPush";
import { registrarBdosVistos } from "../utils/bdosAvisados";
import { prepararSom, tocarAvisoSonoro } from "../utils/som";
import { useIntervaloEmPrimeiroPlano } from "./useIntervaloEmPrimeiroPlano";

const INTERVALO_MS = 30_000;
/** Avisa o painel de que chegou BDO novo, para ele recarregar a lista. */
export const EVENTO_BDOS_NOVOS = "milebag:bdos-novos";

export type AvisoBdoNovo = { quantidade: number; numero: string | null };

// Só o necessário de GET /motorista/bdos-disponiveis (HU19) para descobrir os BDOs novos.
type BdosDisponiveis = { bdos: { bdoId: string; origem: string; bdoNumero: string | null; reaberta?: boolean }[] };

// O aviso fica fora do componente: o layout do motorista é montado de novo a cada tela e o aviso precisa
// continuar visível até ser fechado.
let avisoAtual: AvisoBdoNovo | null = null;
const ouvintes = new Set<() => void>();
let ultimaConsulta = 0;
let consultando = false;
let inscricaoSincronizada = false;

function definirAviso(aviso: AvisoBdoNovo | null) {
  avisoAtual = aviso;
  ouvintes.forEach((ouvinte) => ouvinte());
}

export function limparAvisoBdoNovo() {
  if (avisoAtual) {
    definirAviso(null);
  }
}

/**
 * Descobre BDOs novos recebidos por e-mail (RF25): fotografados e reabertos não avisam. `imediato` vem do push
 * (o servidor já sabe que há BDO novo); a consulta periódica respeita o intervalo, mesmo trocando de tela.
 */
async function verificar(imediato = false) {
  if (consultando || !navigator.onLine || (!imediato && Date.now() - ultimaConsulta < INTERVALO_MS - 1_000)) {
    return;
  }
  consultando = true;
  ultimaConsulta = Date.now();
  try {
    const { bdos } = await requisitar<BdosDisponiveis>("/api/v1/motorista/bdos-disponiveis");
    const porEmail = bdos.filter((bdo) => bdo.origem === "EMAIL_AUTOMATICO" && !bdo.reaberta);
    const novos = registrarBdosVistos(porEmail.map((bdo) => bdo.bdoId));
    if (novos.length === 0) {
      return;
    }
    const quantidade = (avisoAtual?.quantidade ?? 0) + novos.length;
    const numero = quantidade === 1 ? (porEmail.find((bdo) => bdo.bdoId === novos[0])?.bdoNumero ?? null) : null;
    definirAviso({ quantidade, numero });
    tocarAvisoSonoro();
    navigator.vibrate?.([200, 100, 200]);
    window.dispatchEvent(new Event(EVENTO_BDOS_NOVOS));
  } catch {
    // Falha de rede ou da API: tenta de novo no próximo ciclo.
  } finally {
    consultando = false;
  }
}

/** Aviso de bagagem nova (HU32, RI20) com o app aberto: consulta a cada 30 s e, com push, na hora. */
export function useAvisoBdoNovo() {
  const aviso = useSyncExternalStore(
    (ouvinte) => {
      ouvintes.add(ouvinte);
      return () => ouvintes.delete(ouvinte);
    },
    () => avisoAtual,
  );

  useIntervaloEmPrimeiroPlano(verificar, INTERVALO_MS);

  useEffect(() => {
    // Navegadores só tocam som depois de um toque na página.
    document.addEventListener("pointerdown", prepararSom, { once: true, capture: true });
    if (!inscricaoSincronizada) {
      inscricaoSincronizada = true;
      void sincronizarInscricao();
    }
    // O service worker repassa o push quando o app está aberto (public/sw-push.js).
    const aoReceberMensagem = (evento: MessageEvent) => {
      if ((evento.data as { tipo?: string } | null)?.tipo === "bdo-novo") {
        void verificar(true);
      }
    };
    navigator.serviceWorker?.addEventListener("message", aoReceberMensagem);
    return () => {
      document.removeEventListener("pointerdown", prepararSom, { capture: true });
      navigator.serviceWorker?.removeEventListener("message", aoReceberMensagem);
    };
  }, []);

  return { aviso, fechar: limparAvisoBdoNovo };
}
