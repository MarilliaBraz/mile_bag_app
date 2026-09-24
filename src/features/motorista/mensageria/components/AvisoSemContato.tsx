/**
 * Aviso de "sem contato disponível" (HU18, FR-006/FR-007) - no lugar de uma
 * conversa vazia que pareceria um erro. Sem e-mail no BDO não há como
 * convidar o passageiro ao Telegram, então nenhum canal fica disponível; a
 * ligação (HU21), quando houver telefone, continua sendo a alternativa.
 */
export function AvisoSemContato() {
  return (
    <p role="status" style={{ padding: "0.75rem", border: "1px solid var(--aviso)", borderRadius: 8, color: "var(--aviso)" }}>
      Este passageiro não tem e-mail cadastrado no BDO, então não é possível trocar mensagens por aqui. Se houver telefone, use a
      ligação.
    </p>
  );
}
