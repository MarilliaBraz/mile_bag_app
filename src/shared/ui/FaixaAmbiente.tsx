/**
 * Faixa no topo de todas as telas quando o app NÃO é o de produção
 * (VITE_AMBIENTE preenchida no build, ex.: "Homologação"). Quem valida uma
 * mudança sabe em qual ambiente está e qual versão está vendo; em produção a
 * variável fica vazia e nada aparece.
 */
export function FaixaAmbiente() {
  const ambiente = import.meta.env.VITE_AMBIENTE?.trim();
  if (!ambiente) {
    return null;
  }
  const versao = import.meta.env.VITE_VERSAO?.trim();
  return (
    <div className="faixa-ambiente" role="note" aria-label={`Ambiente de ${ambiente}: dados de teste, não use para entregas reais`}>
      <span>Ambiente de {ambiente}: dados de teste, não use para entregas reais.</span>
      {versao && <small>{versao}</small>}
    </div>
  );
}
