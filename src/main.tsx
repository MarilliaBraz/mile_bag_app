import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { App } from "./App.tsx";
import { registrarFalhasGlobais } from "./shared/diagnostico/registroFalhas";
import { aplicarIdiomaSalvo } from "./shared/i18n/idioma";
import { aplicarPreferenciasSalvas } from "./shared/ui/preferencias";

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
