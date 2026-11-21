/**
 * Monta um caminho da API codificando cada valor interpolado: um id vindo da URL do navegador (ex.: "../motoristas")
 * nunca muda o endereço chamado (client-side path traversal). O texto fixo do template fica como está.
 *
 *   caminhoApi`/api/v1/entregas/${entregaId}/viagem`
 *   BASE + caminhoApi`/${id}/atender`
 *
 * Não use para trechos já montados (ex.: uma query string pronta): eles seriam codificados de novo.
 */
export function caminhoApi(partes: TemplateStringsArray, ...valores: Array<string | number>): string {
  return partes.reduce(
    (caminho, parte, indice) => caminho + parte + (indice < valores.length ? encodeURIComponent(String(valores[indice])) : ""),
    "",
  );
}
