import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CadastroTenantForm } from "./CadastroTenantForm";

/** Empresas assinantes (HU14). A API não lista empresas: o cadastro leva à página da nova empresa, e uma existente abre pelo código. */
export function TelaEmpresas() {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState("");

  return (
    <main>
      <h1>Empresas assinantes</h1>

      <h2>Cadastrar empresa</h2>
      <CadastroTenantForm aoCadastrar={(tenant) => navigate(`/plataforma/empresas/${tenant.id}`)} />

      <h2 style={{ marginTop: "2rem" }}>Abrir empresa já cadastrada</h2>
      <form
        style={{ display: "flex", gap: "0.5rem", maxWidth: 520 }}
        onSubmit={(evento) => {
          evento.preventDefault();
          navigate(`/plataforma/empresas/${codigo.trim()}`);
        }}
      >
        <input aria-label="Código da empresa" placeholder="Código da empresa (UUID)" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
        <button type="submit" disabled={!codigo.trim()}>
          Abrir
        </button>
      </form>
    </main>
  );
}
