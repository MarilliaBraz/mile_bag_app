/// <reference types="vite/client" />

/** Variáveis de ambiente do app (modelo documentado em .env.example). */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
