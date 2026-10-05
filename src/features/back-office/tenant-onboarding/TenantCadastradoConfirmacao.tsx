import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatarData, mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { TrocarPlanoTenant } from "../planos/TrocarPlanoTenant";
import { buscarTenant, reenviarConvite } from "./tenantsApi";
import { Alerta } from "../../../shared/ui/Alerta";

/**
 * Empresa cadastrada (HU14) - a mesma página serve de confirmação logo após o
 * cadastro e de consulta depois: reenvio do convite (HU15) e troca de plano
 * (HU16). Não há listagem de empresas na API, então o acesso é pelo id.
 */
export function TenantCadastradoConfirmacao() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const { dados, erro, carregando, recarregar } = useRecurso(() => buscarTenant(tenantId ?? ""), "Não foi possível carregar a empresa.");
  const [conviteReenviado, setConviteReenviado] = useState(false);
  const [erroConvite, setErroConvite] = useState<string | null>(null);

  async function reenviar() {
    setErroConvite(null);
    setConviteReenviado(false);
    try {
      await reenviarConvite(tenantId ?? "");
      setConviteReenviado(true);
    } catch (excecao) {
      setErroConvite(mensagemDeErro(excecao, "Não foi possível reenviar o convite."));
    }
  }

  return (
    <main>
      <Link to="/plataforma/empresas">← Empresas</Link>
      {erro && (
        <Alerta tipo="erro">
          {erro}
        </Alerta>
      )}
      {carregando && <p role="status">Carregando…</p>}

      {dados && (
        <>
          <h1>{dados.nome}</h1>
          <dl>
            <dt>Identificador</dt>
            <dd>{dados.identificadorEmpresa}</dd>
            <dt>Situação</dt>
            <dd>{dados.status}</dd>
            <dt>Cadastrada em</dt>
            <dd>{formatarData(dados.criadoEm)}</dd>
            <dt>Código da empresa</dt>
            <dd style={{ wordBreak: "break-all" }}>{dados.id}</dd>
          </dl>

          <section>
            <h2>Convite do administrador</h2>
            <p>Se o convite não chegou ou expirou, gere um novo. O anterior deixa de valer.</p>
            {erroConvite && (
              <Alerta tipo="erro">
                {erroConvite}
              </Alerta>
            )}
            {conviteReenviado && (
              <Alerta tipo="sucesso">
                Novo convite enviado.
              </Alerta>
            )}
            <button type="button" className="secundario" onClick={reenviar}>
              Reenviar convite
            </button>
          </section>

          <section style={{ marginTop: "2rem" }}>
            <h2>Plano</h2>
            <TrocarPlanoTenant tenantId={dados.id} planoAtualId={dados.planoId} aoTrocar={recarregar} />
          </section>
        </>
      )}
    </main>
  );
}
