import { useCallback, useEffect, useState } from "react";
import { mensagemDeErro } from "../utils/formatar";
import { obterTextos } from "../utils/i18n/idioma";

/** Carrega um recurso da API ao montar e expõe `recarregar` para depois de uma escrita. */
export function useRecurso<T>(carregador: () => Promise<T>, mensagemPadrao?: string) {
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    try {
      setDados(await carregador());
      setErro(null);
    } catch (excecao) {
      setErro(mensagemDeErro(excecao, mensagemPadrao ?? obterTextos().comum.falhaAoCarregar));
    } finally {
      setCarregando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return { dados, erro, carregando, recarregar };
}
