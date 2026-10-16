import { useEffect, useState } from "react";

export type DisplayTheme = "dark" | "light";

export type DisplayPrefs = {
  theme: DisplayTheme;
  glass: boolean;
};

const STORAGE_KEY = "teunesen.tv.display";
const DEFAULT_PREFS: DisplayPrefs = { theme: "dark", glass: true };

function readStoredPrefs(): DisplayPrefs {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<DisplayPrefs> | null;
    return {
      theme: parsed?.theme === "light" ? "light" : "dark",
      glass: parsed?.glass !== false,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function applyPrefs(prefs: DisplayPrefs) {
  const root = document.documentElement;
  root.dataset.theme = prefs.theme;
  root.dataset.glass = prefs.glass ? "on" : "off";
}

export function applyStoredDisplayPrefs() {
  applyPrefs(readStoredPrefs());
}

export function useDisplayPrefs() {
  const [prefs, setPrefs] = useState(readStoredPrefs);

  useEffect(() => {
    applyPrefs(prefs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Zonder opslag blijft de keuze tot het scherm herlaadt.
    }
  }, [prefs]);

  return {
    prefs,
    toggleTheme: () => setPrefs((current) => ({ ...current, theme: current.theme === "dark" ? "light" : "dark" })),
    toggleGlass: () => setPrefs((current) => ({ ...current, glass: !current.glass })),
  };
}
