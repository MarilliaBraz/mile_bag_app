import { CadastroContas } from "../../../../shared/components/contas/CadastroContas";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { servicoFuncionarios } from "../services/funcionariosService";

/** Funcionários da companhia aérea (HU33): o cadastro de contas compartilhado, com a API e os textos de funcionários. */
export function TelaFuncionarios() {
  return <CadastroContas servico={servicoFuncionarios} textos={useTextos().backOffice.funcionarios} />;
}
