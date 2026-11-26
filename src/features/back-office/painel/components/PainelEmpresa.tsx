import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Alerta, Carregando } from "../../../../shared/components/Alerta";
import { CartaoIndicador } from "../../../../shared/components/CartaoIndicador";
import { Icone } from "../../../../shared/components/Icone";
import { Pagina, Painel } from "../../../../shared/components/Pagina";
import { useIntervaloEmPrimeiroPlano } from "../../../../shared/hooks/useIntervaloEmPrimeiroPlano";
import { listarAlertas } from "../../../../shared/services/emergenciaService";
import { listarMotoristas, nomeDoMotorista } from "../../../../shared/services/motoristasService";
import type { Motorista } from "../../../../shared/types/motoristas";
import { hojeIso } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { listarEntregas } from "../../entregas/services/entregasService";
import { listarFechamentos } from "../../fechamento/services/fechamentoService";
import { listarPagamentosPendentes } from "../services/painelService";
import { bdosAtrasados, pagamentoVencido, STATUS_EM_ANDAMENTO, tarefasEmpresa, type DadosPainel } from "../utils/tarefasEmpresa";

const INTERVALO_MS = 30_000;
const TAREFAS_VISIVEIS = 10;

/** Cada consulta que falhar deixa o número como estava; o aviso aparece, mas o resto do painel continua útil. */
function carregarPainel(atual: DadosPainel | null) {
  return Promise.allSettled([listarAlertas("ABERTO"), listarEntregas(null), listarFechamentos(), listarPagamentosPendentes()]).then(
    ([alertas, entregas, fechamentos, pagamentos]) => {
      const valor = <T,>(resultado: PromiseSettledResult<T>, anterior: T | undefined, vazio: T) =>
        resultado.status === "fulfilled" ? resultado.value : (anterior ?? vazio);
      const dados: DadosPainel = {
        alertas: valor(alertas, atual?.alertas, []),
        entregas: valor(entregas, atual?.entregas, []),
        fechamentos: valor(fechamentos, atual?.fechamentos, []),
        pagamentos: valor(pagamentos, atual?.pagamentos, []),
      };
      const falhou = [alertas, entregas, fechamentos, pagamentos].some((resultado) => resultado.status === "rejected");
      return { dados, falhou };
    },
  );
}

/** Item 5: início da empresa de entrega - os números do que está pendente e a lista do que fazer, mais urgente primeiro. */
export function PainelEmpresa() {
  const t = useTextos().backOffice.painel;
  const [dados, setDados] = useState<DadosPainel | null>(null);
  const [falhou, setFalhou] = useState(false);
  const [motoristas, setMotoristas] = useState<Motorista[] | null>(null);
  const [agora, setAgora] = useState(() => Date.now());

  // Última leitura boa: uma consulta que falhar no ciclo mantém o número anterior.
  const ultimos = useRef<DadosPainel | null>(null);
  const atualizar = useCallback(() => {
    void carregarPainel(ultimos.current).then((resultado) => {
      ultimos.current = resultado.dados;
      setDados(resultado.dados);
      setFalhou(resultado.falhou);
      setAgora(Date.now());
    });
  }, []);

  useEffect(() => {
    listarMotoristas().then(setMotoristas, () => setMotoristas([]));
  }, []);
  useIntervaloEmPrimeiroPlano(atualizar, INTERVALO_MS);

  if (!dados) {
    return (
      <Pagina titulo={t.titulo} descricao={t.descricao}>
        <Carregando />
      </Pagina>
    );
  }

  const hoje = hojeIso();
  const tarefas = tarefasEmpresa(dados, agora, hoje, (id) => nomeDoMotorista(motoristas, id), t);
  const vencidos = dados.pagamentos.filter((pagamento) => pagamentoVencido(pagamento, hoje)).length;

  return (
    <Pagina titulo={t.titulo} descricao={t.descricao}>
      {falhou && <Alerta tipo="aviso">{t.falhaCarregar}</Alerta>}
      <div className="indicadores">
        <CartaoIndicador
          rotulo={t.bdosPendentes}
          valor={bdosAtrasados(dados.entregas, agora).length}
          detalhe={t.bdosPendentesAjuda}
          tom="erro"
          para="/admin/entregas"
        />
        <CartaoIndicador rotulo={t.emergencias} valor={dados.alertas.length} tom="erro" para="/admin/emergencias" />
        <CartaoIndicador
          rotulo={t.emAndamento}
          valor={dados.entregas.filter((entrega) => STATUS_EM_ANDAMENTO.has(entrega.status)).length}
          detalhe={t.emAndamentoAjuda}
          para="/admin/entregas"
        />
        <CartaoIndicador
          rotulo={t.fechamentosPendencia}
          valor={dados.fechamentos.filter((fechamento) => fechamento.status === "COM_PENDENCIAS").length}
          tom="aviso"
          para="/admin/fechamentos"
        />
        <CartaoIndicador
          rotulo={t.pagamentosAFazer}
          valor={dados.pagamentos.length}
          detalhe={vencidos > 0 ? t.pagamentosVencidos(vencidos) : undefined}
          tom={vencidos > 0 ? "aviso" : undefined}
          para="/admin/fechamentos"
        />
      </div>
      <Painel titulo={t.aFazer}>
        {tarefas.length === 0 ? (
          <p className="texto-apoio">{t.nadaAFazer}</p>
        ) : (
          <ul className="lista-tarefas">
            {tarefas.slice(0, TAREFAS_VISIVEIS).map((tarefa) => (
              <li key={tarefa.chave}>
                <Link to={tarefa.para} className={tarefa.urgente ? "tarefa-urgente" : undefined}>
                  <Icone nome={tarefa.urgente ? "alerta" : "check"} />
                  <span>{tarefa.texto}</span>
                  <Icone nome="chevron" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        {tarefas.length > TAREFAS_VISIVEIS && <p className="texto-apoio">{t.maisTarefas(tarefas.length - TAREFAS_VISIVEIS)}</p>}
      </Painel>
    </Pagina>
  );
}
