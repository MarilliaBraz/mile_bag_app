import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { App } from "./App.tsx";
import { registrarFalhasGlobais } from "./shared/utils/registroFalhas";
import { aplicarIdiomaSalvo } from "./shared/utils/i18n/idioma";
import { aplicarPreferenciasSalvas } from "./shared/utils/preferencias";

aplicarPreferenciasSalvas();
aplicarIdiomaSalvo();
registrarFalhasGlobais();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
