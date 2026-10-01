import { useEffect, useState } from "react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

let cached = null;

// Shared site flags (currently just whether the Bright Blessing page is published).
export const useSiteSettings = () => {
  const [settings, setSettings] = useState(cached);

  useEffect(() => {
    if (cached) return;
    let alive = true;
    fetch(`${API}/site-settings`)
      .then((r) => r.json())
      .then((d) => { cached = d; if (alive) setSettings(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  return settings;
};

export default useSiteSettings;
