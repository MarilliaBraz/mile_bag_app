import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Icone } from "../../../../shared/components/Icone";
import { Pagina, Painel } from "../../../../shared/components/Pagina";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CadastroTenantForm } from "./CadastroTenantForm";

/** Empresas assinantes (HU14). A API não lista empresas: o cadastro leva à página da nova empresa, e uma existente abre pelo código. */
export function TelaEmpresas() {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState("");
  const t = useTextos().backOffice.empresas;

  return (
    <Pagina titulo={t.titulo} descricao={t.descricao}>
      <div className="grade-paineis">
        <Painel titulo={t.cadastrarEmpresa}>
          <CadastroTenantForm aoCadastrar={(tenant) => navigate(`/plataforma/empresas/${tenant.id}`)} />
        </Painel>

        <Painel titulo={t.abrirTitulo} descricao={t.abrirDescricao}>
          <form
            className="form-linha"
            onSubmit={(evento) => {
              evento.preventDefault();
              navigate(`/plataforma/empresas/${codigo.trim()}`);
            }}
          >
            <div>
              <label htmlFor="codigo-empresa">{t.codigoEmpresa}</label>
              <input
                id="codigo-empresa"
                placeholder={t.codigoExemplo}
                spellCheck={false}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
            </div>
            <button type="submit" disabled={!codigo.trim()}>
              {t.abrir} <Icone nome="chevron" />
            </button>
          </form>
        </Painel>
      </div>
    </Pagina>
  );
}
