import { useId } from "react";
import { Alerta } from "../../../../shared/components/Alerta";
import { useRecurso } from "../../../../shared/hooks/useRecurso";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { listarAeroportos } from "../services/bagagensService";
import type { BagagemEncontrada } from "../types";
import { formatarDistancia } from "../utils/formatarDistancia";

type Props = { bagagem: BagagemEncontrada; valor: string; aoMudar: (codigo: string) => void };

/** Escolha do aeroporto, com de onde veio a localização e a sugestão com a distância. */
export function CampoAeroporto({ bagagem, valor, aoMudar }: Props) {
  const uid = useId();
  const t = useTextos().companhia.bagagens;
  const { dados: aeroportos } = useRecurso(listarAeroportos, t.falhaRegistrar);

  return (
    <>
      <div>
        <label htmlFor={`${uid}-aeroporto`}>{t.aeroporto}</label>
        {/* A lista chega depois da montagem: remontar com ela faz o aeroporto sugerido aparecer escolhido. */}
        <select
          key={aeroportos?.length ?? 0}
          id={`${uid}-aeroporto`}
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          aria-describedby={`${uid}-local`}
        >
          <option value="">{t.escolhaAeroporto}</option>
          {aeroportos?.map((a) => (
            <option key={a.codigo} value={a.codigo}>
              {a.codigo} · {a.cidade}/{a.uf} · {a.nome}
            </option>
          ))}
        </select>
        <span id={`${uid}-local`} className="texto-apoio">
          {t.localizacao[bagagem.localizacao.origem]}{" "}
          {bagagem.aeroporto?.distanciaMetros !== undefined &&
            t.sugerido(bagagem.aeroporto.codigo, formatarDistancia(bagagem.aeroporto.distanciaMetros))}
        </span>
      </div>
      {bagagem.aeroporto?.distante && <Alerta tipo="aviso">{t.distante}</Alerta>}
    </>
  );
}
