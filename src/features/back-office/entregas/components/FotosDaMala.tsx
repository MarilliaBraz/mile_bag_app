import { useCallback } from "react";
import { formatarDataHora } from "../../../../shared/utils/formatar";
import { useRecurso } from "../../../../shared/hooks/useRecurso";
import { useUrlDoArquivo } from "../../../../shared/hooks/useUrlDoArquivo";
import { useTextos } from "../../../../shared/utils/i18n/idioma";
import { Alerta, Carregando } from "../../../../shared/components/Alerta";
import { baixarFoto, listarFotos } from "../services/entregasService";
import type { FotoEntrega } from "../types";

/** Fotos da entrega para a empresa (V48): retirada, avarias, porta e BDO assinado. Tocar abre a foto inteira. */
export function FotosDaMala({ entregaId }: { entregaId: string }) {
  const t = useTextos().backOffice.entregas;
  const { dados, erro } = useRecurso(() => listarFotos(entregaId), t.falhaFotos);

  return (
    <section className="pilha divisor-topo" aria-labelledby="fotos-da-mala">
      <h3 id="fotos-da-mala">{t.fotos}</h3>
      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {!dados && !erro && <Carregando />}
      {dados && dados.length === 0 && <p className="texto-apoio">{t.semFotos}</p>}
      {dados && dados.length > 0 && (
        <ul className="fotos-avaria">
          {dados.map((foto) => (
            <Miniatura
              key={foto.id}
              entregaId={entregaId}
              foto={foto}
              rotulo={`${t.tiposFoto[foto.tipo] ?? foto.tipo}${foto.substituida ? ` (${t.substituida})` : ""}`}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function Miniatura({ entregaId, foto, rotulo }: { entregaId: string; foto: FotoEntrega; rotulo: string }) {
  const baixar = useCallback(() => baixarFoto(entregaId, foto.id), [entregaId, foto.id]);
  const url = useUrlDoArquivo(baixar);
  return (
    <li>
      <figure className="m-0">
        {url ? (
          <a href={url} target="_blank" rel="noreferrer">
            <img src={url} alt={rotulo} />
          </a>
        ) : (
          <Carregando />
        )}
        <figcaption>
          {rotulo} · {formatarDataHora(foto.dataHora)}
        </figcaption>
      </figure>
    </li>
  );
}
