import { useState } from "react";
import { mensagemDeErro } from "../../../shared/format/formatar";
import { useRecurso } from "../../../shared/hooks/useRecurso";
import { listarPlanos } from "../planos/planosApi";
import { cadastrarTenant, type Tenant } from "./tenantsApi";

/** Cadastro de empresa assinante (HU14) - já dispara o convite por e-mail ao primeiro administrador (HU15). */
export function CadastroTenantForm({ aoCadastrar }: { aoCadastrar: (tenant: Tenant) => void }) {
  const { dados: planos, erro: erroPlanos } = useRecurso(listarPlanos, "Não foi possível carregar os planos.");
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
      setErro(mensagemDeErro(excecao, "Não foi possível cadastrar a empresa."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={enviar} style={{ display: "grid", gap: "0.75rem", maxWidth: 480 }}>
      {(erro || erroPlanos) && (
        <p role="alert" style={{ color: "var(--erro)", margin: 0 }}>
          {erro ?? erroPlanos}
        </p>
      )}
      <div>
        <label htmlFor="identificadorEmpresa">Identificador da empresa</label>
        <input id="identificadorEmpresa" value={identificador} onChange={(e) => setIdentificador(e.target.value)} placeholder="Ex.: transportes-alfa" />
      </div>
      <div>
        <label htmlFor="nomeEmpresa">Nome</label>
        <input id="nomeEmpresa" value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div>
        <label htmlFor="planoEmpresa">Plano</label>
        <select id="planoEmpresa" value={planoId} onChange={(e) => setPlanoId(e.target.value)}>
          <option value="">Escolha um plano</option>
          {planos?.map(({ plano }) => (
            <option key={plano.id} value={plano.id}>
              {plano.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="emailAdministrador">E-mail do primeiro administrador</label>
        <input id="emailAdministrador" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <span style={{ fontSize: "0.85rem" }}>Esse e-mail recebe o convite para definir a senha.</span>
      </div>
      <div>
        <button type="submit" disabled={invalido || salvando}>
          {salvando ? "Cadastrando…" : "Cadastrar empresa"}
        </button>
      </div>
    </form>
  );
}
