import { useState } from "react";
import { mensagemDeErro } from "../../../../shared/utils/formatar";
import { useRecurso } from "../../../../shared/hooks/useRecurso";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { listarPlanos } from "../../../../shared/services/planosService";
import { cadastrarTenant } from "../services/tenantsService";
import type { Tenant } from "../types";
import { Alerta } from "../../../../shared/components/Alerta";

/** Cadastro de empresa assinante (HU14) - já dispara o convite por e-mail ao primeiro administrador (HU15). */
export function CadastroTenantForm({ aoCadastrar }: { aoCadastrar: (tenant: Tenant) => void }) {
  const textos = useTextos().backOffice;
  const t = textos.empresas;
  const { dados: planos, erro: erroPlanos } = useRecurso(listarPlanos, textos.planos.falhaCarregar);
  const [identificador, setIdentificador] = useState("");
  const [nome, setNome] = useState("");
  const [planoId, setPlanoId] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const invalido = !identificador.trim() || !nome.trim() || !planoId || !email.includes("@");

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      const tenant = await cadastrarTenant({
        identificadorEmpresa: identificador.trim(),
        nome: nome.trim(),
        planoId,
        emailAdministrador: email.trim(),
      });
      aoCadastrar(tenant);
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaCadastrar));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="formulario">
      {(erro || erroPlanos) && <Alerta tipo="erro">{erro ?? erroPlanos}</Alerta>}
      <div>
        <label htmlFor="identificadorEmpresa">{t.identificador}</label>
        <input
          id="identificadorEmpresa"
          value={identificador}
          spellCheck={false}
          autoCapitalize="none"
          onChange={(e) => setIdentificador(e.target.value)}
          placeholder={t.identificadorExemplo}
        />
      </div>
      <div>
        <label htmlFor="nomeEmpresa">{t.nome}</label>
        <input id="nomeEmpresa" value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div>
        <label htmlFor="planoEmpresa">{t.plano}</label>
        <select id="planoEmpresa" value={planoId} onChange={(e) => setPlanoId(e.target.value)}>
          <option value="">{t.escolhaPlano}</option>
          {planos?.map(({ plano }) => (
            <option key={plano.id} value={plano.id}>
              {plano.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="emailAdministrador">{t.emailAdministrador}</label>
        <input id="emailAdministrador" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <span className="texto-apoio">{t.emailAdministradorAjuda}</span>
      </div>
      <button type="submit" disabled={invalido || salvando}>
        {salvando ? t.cadastrando : t.cadastrarEnviar}
      </button>
    </form>
  );
}
