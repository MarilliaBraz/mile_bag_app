import { useEffect, useState } from "react";
import { Alerta } from "../../../../shared/components/Alerta";
import { Painel } from "../../../../shared/components/Pagina";
import { mensagemDeErro } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { obterConfigPainelGestao, salvarConfigPainelGestao } from "../../painel/services/painelService";

/** Painel de gestão (V61): prazo padrão da mala e depois de quantas horas sem atualização ela vira exceção. */
export function SecaoPainelGestao() {
  const t = useTextos().backOffice.configuracoes;
  const [prazo, setPrazo] = useState("");
  const [horas, setHoras] = useState("");
  const [meta, setMeta] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    obterConfigPainelGestao().then(
      (config) => {
        setPrazo(String(config.prazoEntregaHoras));
        setHoras(String(config.horasSemAtualizacao));
        setMeta(String(config.metaOtd));
      },
      (excecao) => setErro(mensagemDeErro(excecao, t.falhaPainelGestao)),
    );
  }, [t.falhaPainelGestao]);

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setSalvo(false);
    setOcupado(true);
    try {
      const config = await salvarConfigPainelGestao({
        prazoEntregaHoras: Number(prazo),
        horasSemAtualizacao: Number(horas),
        metaOtd: Number(meta),
      });
      setPrazo(String(config.prazoEntregaHoras));
      setHoras(String(config.horasSemAtualizacao));
      setMeta(String(config.metaOtd));
      setSalvo(true);
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaPainelGestao));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Painel titulo={t.painelGestaoTitulo} descricao={t.painelGestaoDescricao}>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {salvo && (
        <Alerta tipo="sucesso" aoFechar={() => setSalvo(false)}>
          {t.painelGestaoSalvo}
        </Alerta>
      )}
      <form onSubmit={salvar} className="pilha">
        <div>
          <label htmlFor="prazoPadraoHoras">{t.prazoPadraoHoras}</label>
          <input id="prazoPadraoHoras" type="number" min={1} max={720} required value={prazo} onChange={(e) => setPrazo(e.target.value)} />
        </div>
        <div>
          <label htmlFor="horasSemAtualizacao">{t.horasSemAtualizacao}</label>
          <input
            id="horasSemAtualizacao"
            type="number"
            min={1}
            max={168}
            required
            value={horas}
            onChange={(e) => setHoras(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="metaOtd">{t.metaOtd}</label>
          <input id="metaOtd" type="number" min={50} max={100} required value={meta} onChange={(e) => setMeta(e.target.value)} />
        </div>
        <button type="submit" disabled={ocupado || !prazo || !horas || !meta}>
          {t.salvarPainelGestao}
        </button>
      </form>
    </Painel>
  );
}
