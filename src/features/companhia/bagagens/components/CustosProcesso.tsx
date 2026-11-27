import { useCallback, useEffect, useId, useState } from "react";
import { Alerta } from "../../../../shared/components/Alerta";
import { Painel } from "../../../../shared/components/Pagina";
import { formatarData, formatarMoeda, hojeIso, mensagemDeErro } from "../../../../shared/utils/formatar";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { lancarCusto, listarCustos, removerCusto } from "../services/bagagensService";
import type { CustoProcesso, TipoCusto } from "../types";

const TIPOS: TipoCusto[] = ["FRETE", "VOUCHER", "REEMBOLSO_EMERGENCIAL", "INDENIZACAO", "OUTRO"];

/** Painel da companhia, fase 3: o que a companhia pagou neste processo (frete, vouchers, reembolsos, indenização). */
export function CustosProcesso({ bagagemId }: { bagagemId: string }) {
  const t = useTextos().companhia.custos;
  const uid = useId();
  const [custos, setCustos] = useState<CustoProcesso[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [tipo, setTipo] = useState<TipoCusto>("FRETE");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(hojeIso());
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(() => {
    listarCustos(bagagemId).then(setCustos, (excecao) => setErro(mensagemDeErro(excecao, t.falhaCarregar)));
  }, [bagagemId, t.falhaCarregar]);
  useEffect(carregar, [carregar]);

  const valorNumero = Number(valor.replace(",", "."));
  const total = custos.reduce((soma, custo) => soma + custo.valor, 0);

  async function lancar(evento: React.FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      await lancarCusto(bagagemId, { tipo, valor: valorNumero, data, descricao: descricao.trim() || undefined });
      setValor("");
      setDescricao("");
      carregar();
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaLancar));
    } finally {
      setEnviando(false);
    }
  }

  async function remover(custo: CustoProcesso) {
    setErro(null);
    try {
      await removerCusto(bagagemId, custo.id);
      carregar();
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, t.falhaRemover));
    }
  }

  return (
    <Painel titulo={t.titulo} descricao={t.descricao}>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {custos.length === 0 ? (
        <p className="texto-apoio">{t.vazio}</p>
      ) : (
        <div className="tabela-rolavel">
          <table className="tabela">
            <thead>
              <tr>
                <th scope="col">{t.data}</th>
                <th scope="col">{t.tipo}</th>
                <th scope="col">{t.valor}</th>
                <th scope="col">{t.descricaoCampo}</th>
                <th scope="col">
                  <span className="visualmente-oculto">{t.remover}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {custos.map((custo) => (
                <tr key={custo.id}>
                  <td>{formatarData(custo.data)}</td>
                  <td>{t.tipos[custo.tipo]}</td>
                  <td>{formatarMoeda(custo.valor)}</td>
                  <td>{custo.descricao ?? "–"}</td>
                  <td>
                    <button
                      type="button"
                      className="perigo-fantasma compacto"
                      aria-label={t.removerRotulo(t.tipos[custo.tipo], formatarMoeda(custo.valor))}
                      onClick={() => void remover(custo)}
                    >
                      {t.remover}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {custos.length > 0 && <p>{t.total(formatarMoeda(total))}</p>}
      <form className="form-linha" onSubmit={lancar}>
        <div>
          <label htmlFor={`${uid}-tipo`}>{t.tipo}</label>
          <select id={`${uid}-tipo`} value={tipo} onChange={(e) => setTipo(e.target.value as TipoCusto)}>
            {TIPOS.map((opcao) => (
              <option key={opcao} value={opcao}>
                {t.tipos[opcao]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${uid}-valor`}>{t.valor}</label>
          <input id={`${uid}-valor`} inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} />
        </div>
        <div>
          <label htmlFor={`${uid}-data`}>{t.data}</label>
          <input id={`${uid}-data`} type="date" max={hojeIso()} value={data} onChange={(e) => setData(e.target.value)} />
        </div>
        <div>
          <label htmlFor={`${uid}-descricao`}>{t.descricaoCampo}</label>
          <input id={`${uid}-descricao`} maxLength={200} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </div>
        <button type="submit" disabled={enviando || !(valorNumero > 0) || !data}>
          {enviando ? t.lancando : t.lancar}
        </button>
      </form>
    </Painel>
  );
}
