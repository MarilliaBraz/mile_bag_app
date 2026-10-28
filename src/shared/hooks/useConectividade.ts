import { useEffect, useState } from "react";

/** Estado de conectividade do dispositivo (HU08, FR-002), via eventos `online`/`offline` do navegador. */
export function useConectividade(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const ficouOnline = () => setOnline(true);
    const ficouOffline = () => setOnline(false);
    window.addEventListener("online", ficouOnline);
    window.addEventListener("offline", ficouOffline);
    return () => {
      window.removeEventListener("online", ficouOnline);
      window.removeEventListener("offline", ficouOffline);
    };
  }, []);

  return online;
}
