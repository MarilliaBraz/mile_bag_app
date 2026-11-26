import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Alerta, Carregando } from "../../../../shared/components/Alerta";
import { CartaoIndicador } from "../../../../shared/components/CartaoIndicador";
import { Icone } from "../../../../shared/components/Icone";
import { Gaveta, Pagina, Painel } from "../../../../shared/components/Pagina";
import { useIntervaloEmPrimeiroPlano } from "../../../../shared/hooks/useIntervaloEmPrimeiroPlano";
import { listarAlertas } from "../../../../shared/services/emergenciaService";
import { listarMotoristas, nomeDoMotorista } from "../../../../shared/services/motoristasService";
import type { Motorista } from "../../../../shared/types/motoristas";
import { hojeIso } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { listarEntregas } from "../../entregas/services/entregasService";
import { listarFechamentos } from "../../fechamento/services/fechamentoService";
import { listarPagamentosPendentes, obterPainelGestao } from "../services/painelService";
import type { ItemMala } from "../types";
import { bdosAtrasados, pagamentoVencido, tarefasEmpresa, type DadosPainel } from "../utils/tarefasEmpresa";
import { ExcecoesCriticas } from "./ExcecoesCriticas";
import { ListaMalas } from "./ListaMalas";
import { PulsoOperacao, type AbrirLista } from "./PulsoOperacao";

const INTERVALO_MS = 30_000;
const TAREFAS_VISIVEIS = 10;

/** Cada consulta que falhar deixa o número como estava; o aviso aparece, mas o resto do painel continua útil. */
function carregarPainel(atual: DadosPainel | null) {
  return Promise.allSettled([
    listarAlertas("ABERTO"),
    listarEntregas(null),
    listarFechamentos(),
    listarPagamentosPendentes(),
    obterPainelGestao(),
  ]).then(([alertas, entregas, fechamentos, pagamentos, gestao]) => {
    const valor = <T,>(resultado: PromiseSettledResult<T>, anterior: T | undefined, vazio: T) =>
      resultado.status === "fulfilled" ? resultado.value : (anterior ?? vazio);
    const dados: DadosPainel = {
      alertas: valor(alertas, atual?.alertas, []),
      entregas: valor(entregas, atual?.entregas, []),
      fechamentos: valor(fechamentos, atual?.fechamentos, []),
      pagamentos: valor(pagamentos, atual?.pagamentos, []),
      gestao: valor(gestao, atual?.gestao ?? undefined, null),
    };
    const falhou = [alertas, entregas, fechamentos, pagamentos, gestao].some((resultado) => resultado.status === "rejected");
    return { dados, falhou };
  });
}

type ListaAberta = { titulo: string; itens: ItemMala[]; mostrar: "prazo" | "referencia" };

/**
 * Início da empresa de entrega: pulso da operação (SLA, funil, OTD, ciclo), exceções críticas e a lista do que
 * fazer, mais urgente primeiro. Cada número abre a lista das malas para agir.
 */
export function PainelEmpresa() {
  const t = useTextos().backOffice.painel;
  const [dados, setDados] = useState<DadosPainel | null>(null);
  const [falhou, setFalhou] = useState(false);
  const [motoristas, setMotoristas] = useState<Motorista[] | null>(null);
  const [agora, setAgora] = useState(() => Date.now());
  const [lista, setLista] = useState<ListaAberta | null>(null);
  const abrirLista: AbrirLista = (titulo, itens, mostrar) => setLista({ titulo, itens, mostrar });

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
      {dados.gestao ? (
        <>
          <PulsoOperacao painel={dados.gestao} abrirLista={abrirLista} />
          <ExcecoesCriticas
            painel={dados.gestao}
            bdosSemMotorista={bdosAtrasados(dados.entregas, agora).length}
            emergencias={dados.alertas.length}
            abrirLista={abrirLista}
          />
        </>
      ) : (
        <Alerta tipo="erro">{t.falhaGestao}</Alerta>
      )}
      <div className="indicadores secao-painel">
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
      <Gaveta aberta={lista !== null} titulo={lista?.titulo ?? ""} aoFechar={() => setLista(null)}>
        {lista && <ListaMalas itens={lista.itens} mostrar={lista.mostrar} />}
      </Gaveta>
    </Pagina>
  );
}
