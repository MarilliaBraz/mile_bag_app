import { useState } from "react";
import { useParams } from "react-router-dom";
import { formatarData, mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { TrocarPlanoTenant } from "../planos/TrocarPlanoTenant";
import { buscarTenant, reenviarConvite } from "./tenantsApi";
import { Alerta, Carregando } from "../../../shared/ui/Alerta";
import { Icone } from "../../../shared/ui/Icone";
import { Pagina, Painel } from "../layout/Pagina";

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
    <Pagina titulo={dados?.nome ?? "Empresa"} voltarPara="/plataforma/empresas" rotuloVoltar="Empresas">
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {carregando && <Carregando texto="Carregando empresa…" />}

      {dados && (
        <>
          <Painel>
            <dl className="dados-grade">
              <div>
                <dt>Identificador</dt>
                <dd className="codigo">{dados.identificadorEmpresa}</dd>
              </div>
              <div>
                <dt>Situação</dt>
                <dd>
                  <span className={`selo ${dados.status === "ATIVO" ? "selo-sucesso" : "selo-aviso"}`}>{dados.status}</span>
                </dd>
              </div>
              <div>
                <dt>Cadastrada em</dt>
                <dd>{formatarData(dados.criadoEm)}</dd>
              </div>
              <div>
                <dt>Código da empresa</dt>
                <dd className="codigo" style={{ wordBreak: "break-all", fontSize: "0.9375rem" }}>
                  {dados.id}
                </dd>
              </div>
            </dl>
          </Painel>

          <div className="grade-paineis mt-5">
            <Painel titulo="Convite do administrador" descricao="Se o convite não chegou ou expirou, gere um novo. O anterior deixa de valer.">
              {erroConvite && <Alerta tipo="erro">{erroConvite}</Alerta>}
              {conviteReenviado && <Alerta tipo="sucesso">Novo convite enviado.</Alerta>}
              <button type="button" className="secundario" onClick={reenviar}>
                <Icone nome="email" /> Reenviar convite
              </button>
            </Painel>

            <Painel titulo="Plano">
              <TrocarPlanoTenant tenantId={dados.id} planoAtualId={dados.planoId} aoTrocar={recarregar} />
            </Painel>
          </div>
        </>
      )}
    </Pagina>
  );
}
