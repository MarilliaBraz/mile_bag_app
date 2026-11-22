import { useEffect, useState } from "react";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Icone } from "../../../../shared/components/Icone";
import { consultarDetalhe } from "../services/painelService";
import { malasParaConferir, type MalasDoBdo } from "../utils/malas";

const ESPERA_MAXIMA_MS = 5000;

/**
 * Item 8: lembra ao motorista quantas malas tem cada BDO (o da entrega e as caronas) e pede que ele confirme a
 * conferência - na retirada no aeroporto e na entrega. Sem internet (ou com sinal tão fraco que o detalhe não chega em
 * {@link ESPERA_MAXIMA_MS}) o quadro não aparece e não bloqueia a etapa: {@code aoMudar(true)} libera o passo, como a
 * localização da retirada.
 */
export function ConferenciaMalas({
  entregaId,
  momento,
  aoMudar,
}: {
  entregaId: string;
  momento: "retirada" | "entrega";
  aoMudar: (liberado: boolean) => void;
}) {
  const t = useTextos().motorista.malas;
  const [quadro, setQuadro] = useState<{ linhas: MalasDoBdo[]; total: number | null } | null>(null);
  const [conferido, setConferido] = useState(false);

  useEffect(() => {
    let ativo = true;
    // Rede pendurada não pode travar a retirada nem a entrega: passado o prazo, libera e ignora a resposta tardia.
    const prazo = window.setTimeout(() => {
      if (ativo) {
        ativo = false;
        aoMudar(true);
      }
    }, ESPERA_MAXIMA_MS);
    consultarDetalhe(entregaId)
      .then((detalhe) => {
        if (ativo) {
          setQuadro(malasParaConferir(detalhe));
          aoMudar(false);
        }
      })
      .catch(() => {
        if (ativo) {
          aoMudar(true);
        }
      })
      .finally(() => window.clearTimeout(prazo));
    return () => {
      ativo = false;
      window.clearTimeout(prazo);
    };
    // Só a entrega define o quadro; aoMudar é o setState de quem usa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entregaId]);

  if (!quadro) {
    return null;
  }

  const titulo =
    quadro.total == null ? t.tituloSemTotal : momento === "retirada" ? t.tituloRetirada(quadro.total) : t.tituloEntrega(quadro.total);
  const rotulo = momento === "retirada" ? t.conferiRetirada(quadro.total) : t.conferiEntrega(quadro.total);

  return (
    <div className="cartao" role="group" aria-label={titulo}>
      <p className="destaque mb-0">
        <Icone nome="mala" /> {titulo}
      </p>
      <ul className="lista" style={{ gap: "0.25rem" }}>
        {quadro.linhas.map((linha, indice) => (
          <li key={`${linha.bdoNumero ?? "bdo"}-${indice}`}>
            <span className="codigo">{linha.bdoNumero ?? "-"}</span> · {t.quantidade(linha.quantidade)}
            {linha.carona && <span className="texto-apoio"> ({t.carona})</span>}
          </li>
        ))}
      </ul>
      {quadro.total == null && <p className="texto-apoio mb-0">{t.semQuantidade}</p>}
      <label className="interruptor">
        <input
          type="checkbox"
          checked={conferido}
          onChange={(evento) => {
            setConferido(evento.target.checked);
            aoMudar(evento.target.checked);
          }}
        />
        <span>{rotulo}</span>
      </label>
    </div>
  );
}
