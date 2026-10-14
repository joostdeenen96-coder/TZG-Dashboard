declare global {
  interface Window {
    __teunesenTvLog?: () => string[];
  }
}

export type TvLogLevel = "info" | "warn" | "error";

const buffer: string[] = [];
let guardsInstalled = false;

function write(level: TvLogLevel, line: string) {
  buffer.push(line);
  if (buffer.length > 80) buffer.shift();
  const prefixed = `[teunesen-tv] ${line}`;
  if (level === "error") console.error(prefixed);
  else if (level === "warn") console.warn(prefixed);
  else console.info(prefixed);
}

export function tvLog(level: TvLogLevel, scope: string, message: string) {
  const stamp = new Date().toISOString();
  write(level, `${stamp} ${level} ${scope} ${message}`);
}

export function getTvLog() {
  return [...buffer];
}

export function installTvGuards() {
  if (guardsInstalled || typeof window === "undefined") return;
  guardsInstalled = true;
  window.__teunesenTvLog = getTvLog;
  window.addEventListener("error", (event) => {
    tvLog("error", "scherm", event.message || "Scriptfout.");
  });
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : "Onverwerkte fout.";
    tvLog("error", "scherm", message);
  });
  tvLog("info", "scherm", "Bewaking actief.");
}
