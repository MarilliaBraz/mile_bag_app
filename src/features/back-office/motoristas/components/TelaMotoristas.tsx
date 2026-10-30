import { CadastroContas } from "../../../../shared/components/contas/CadastroContas";
import { servicoMotoristas } from "../../../../shared/services/motoristasService";
import { useTextos } from "../../../../shared/utils/i18n/idioma";

/** Motoristas da empresa (HU23): o cadastro de contas compartilhado, com a API e os textos de motoristas. */
export function TelaMotoristas() {
  return <CadastroContas servico={servicoMotoristas} textos={useTextos().backOffice.motoristas} />;
}
