import { Icone } from "../../../shared/ui/Icone";
import { Pagina, Painel } from "../layout/Pagina";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CadastroTenantForm } from "./CadastroTenantForm";

/** Empresas assinantes (HU14). A API não lista empresas: o cadastro leva à página da nova empresa, e uma existente abre pelo código. */
export function TelaEmpresas() {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState("");

  return (
    <Pagina titulo="Empresas assinantes" descricao="Cadastre a empresa e o e-mail do primeiro administrador: ele recebe um convite para definir a própria senha e já pode começar a operar.">
      <div className="grade-paineis">
        <Painel titulo="Cadastrar empresa">
          <CadastroTenantForm aoCadastrar={(tenant) => navigate(`/plataforma/empresas/${tenant.id}`)} />
        </Painel>

        <Painel titulo="Abrir empresa já cadastrada" descricao="Use o código da empresa (aparece na página dela depois do cadastro).">
          <form
            className="form-linha"
            onSubmit={(evento) => {
              evento.preventDefault();
              navigate(`/plataforma/empresas/${codigo.trim()}`);
            }}
          >
            <div>
              <label htmlFor="codigo-empresa">Código da empresa</label>
              <input id="codigo-empresa" placeholder="Ex.: 3f2b…" spellCheck={false} value={codigo} onChange={(e) => setCodigo(e.target.value)} />
            </div>
            <button type="submit" disabled={!codigo.trim()}>
              Abrir <Icone nome="chevron" />
            </button>
          </form>
        </Painel>
      </div>
    </Pagina>
  );
}
