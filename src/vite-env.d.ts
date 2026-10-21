/// <reference types="vite/client" />

/** Variáveis de ambiente do app (modelo documentado em .env.example). */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  /** Nome do ambiente mostrado na faixa do topo (ex.: "Homologação"); vazio em produção. */
  readonly VITE_AMBIENTE?: string;
  /** Versão implantada (branch e commit), mostrada na faixa de ambiente. */
  readonly VITE_VERSAO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
