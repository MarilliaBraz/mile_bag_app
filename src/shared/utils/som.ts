/**
 * Sinal sonoro curto do aviso de bagagem nova (HU32), gerado no próprio aparelho (Web Audio): sem arquivo para
 * baixar e funciona offline. Navegadores só liberam áudio depois de um toque na página; {@link prepararSom} é
 * chamado no primeiro toque para o som estar pronto quando o aviso chegar.
 */

let contexto: AudioContext | null = null;

function obterContexto(): AudioContext | null {
  if (!contexto && typeof window.AudioContext === "function") {
    contexto = new window.AudioContext();
  }
  return contexto;
}

export function prepararSom(): void {
  const audio = obterContexto();
  if (audio?.state === "suspended") {
    void audio.resume();
  }
}

/** Dois bipes ascendentes (~0,35 s), audíveis no carro sem assustar. */
export function tocarAvisoSonoro(): void {
  const audio = obterContexto();
  if (!audio) {
    return;
  }
  void audio.resume();
  const agora = audio.currentTime;
  for (const [frequencia, inicio] of [
    [880, 0],
    [1175, 0.18],
  ]) {
    const oscilador = audio.createOscillator();
    const volume = audio.createGain();
    oscilador.type = "sine";
    oscilador.frequency.value = frequencia;
    volume.gain.setValueAtTime(0.0001, agora + inicio);
    volume.gain.exponentialRampToValueAtTime(0.4, agora + inicio + 0.02);
    volume.gain.exponentialRampToValueAtTime(0.0001, agora + inicio + 0.16);
    oscilador.connect(volume).connect(audio.destination);
    oscilador.start(agora + inicio);
    oscilador.stop(agora + inicio + 0.17);
  }
}
