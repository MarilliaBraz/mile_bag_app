import { useTextos } from "../../../../shared/utils/i18n/idioma";
import type { DadosPassageiroBdo } from "../../../../shared/types/bdo";

export type CampoPassageiro = keyof DadosPassageiroBdo;

/**
 * Nome, endereço (logradouro, cidade, UF e CEP), telefone e e-mail do passageiro: os mesmos campos na inclusão do BDO
 * (V49) e na correção dos dados depois de incluído (V59). `prefixo` deixa os ids únicos quando há dois formulários na tela.
 */
export function CamposPassageiroBdo({
  valores,
  alterar,
  prefixo,
}: {
  valores: DadosPassageiroBdo;
  alterar: (campo: CampoPassageiro, valor: string) => void;
  prefixo: string;
}) {
  const t = useTextos().backOffice.entregas.incluir;

  function campo(id: CampoPassageiro, rotulo: string, extra: { obrigatorio?: boolean; maximo?: number; tipo?: string } = {}) {
    return (
      <div>
        <label htmlFor={`${prefixo}-${id}`}>
          {rotulo}
          {extra.obrigatorio && <span aria-hidden="true"> *</span>}
        </label>
        <input
          id={`${prefixo}-${id}`}
          type={extra.tipo ?? "text"}
          required={extra.obrigatorio}
          maxLength={extra.maximo}
          value={valores[id] ?? ""}
          onChange={(evento) => alterar(id, evento.target.value)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="form-linha">{campo("passageiroNome", t.passageiro, { obrigatorio: true, maximo: 200 })}</div>
      <div className="form-linha">{campo("enderecoEntrega", t.endereco, { obrigatorio: true, maximo: 300 })}</div>
      <div className="form-linha">
        {campo("cidade", t.cidade, { maximo: 100 })}
        {campo("uf", t.uf, { maximo: 2 })}
        {campo("cep", t.cep, { maximo: 9 })}
      </div>
      <div className="form-linha">
        {campo("telefonePassageiro", t.telefone, { maximo: 30, tipo: "tel" })}
        {campo("emailPassageiro", t.email, { maximo: 200, tipo: "email" })}
      </div>
    </>
  );
}
