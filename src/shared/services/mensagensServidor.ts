import { obterTextos } from "../utils/i18n/idioma";

type ChaveMensagem = keyof ReturnType<typeof obterTextos>["mensagensServidor"];

/**
 * Mensagens do servidor que o motorista vê no fluxo da viagem, trocadas por texto claro, com acento e com o que fazer
 * em seguida (o servidor fala em "trajeto" e "checkpoints" e sem acento - GYNLA25237, 2026-11-22). A chave é o texto
 * exato devolvido pela API; se ele mudar lá, a mensagem original volta a aparecer, sem quebrar nada.
 */
const POR_TEXTO_DO_SERVIDOR: Record<string, ChaveMensagem> = {
  "Esta entrega nao tem um trajeto iniciado.": "semViagem",
  "O trajeto desta entrega ja esta encerrado; nao aceita novos checkpoints.": "viagemEncerrada",
  "A viagem desta entrega ja esta encerrada; nao e possivel registrar novo calculo de rota.": "trocaComViagemEncerrada",
  "Nenhuma rota foi selecionada para esta entrega; selecione uma rota antes de iniciar a viagem.": "semRotaEscolhida",
  "Esta entrega ja possui um trajeto iniciado.": "viagemJaIniciada",
  "A retirada desta bagagem ja foi registrada.": "retiradaJaRegistrada",
  "Registre a retirada da bagagem (com a foto) antes de iniciar a viagem.": "retiradaAntesDaViagem",
  "A retirada so pode ser registrada antes de iniciar a viagem.": "retiradaDepoisDaViagem",
  "Esta entrega ja possui um comprovante registrado.": "entregaJaRegistrada",
};

export function traduzirMensagemServidor(texto: string | undefined): string | undefined {
  const chave = texto ? POR_TEXTO_DO_SERVIDOR[texto] : undefined;
  return chave ? obterTextos().mensagensServidor[chave] : texto;
}
