import { Component, type ReactNode } from "react";
import { tvLog } from "../services/tvLog";

const RELOAD_KEY = "teunesen.tv.reloads";

type ScreenGuardProps = {
  children: ReactNode;
};

type ScreenGuardState = {
  failed: boolean;
};

export class ScreenGuard extends Component<ScreenGuardProps, ScreenGuardState> {
  state: ScreenGuardState = { failed: false };

  static getDerivedStateFromError(): ScreenGuardState {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    const message = error instanceof Error ? error.message : "Het scherm stopte.";
    tvLog("error", "scherm", message);
    try {
      const count = Number(sessionStorage.getItem(RELOAD_KEY) ?? "0");
      if (Number.isFinite(count) && count < 2) {
        sessionStorage.setItem(RELOAD_KEY, String(count + 1));
        window.setTimeout(() => window.location.reload(), 8_000);
      }
    } catch {
      tvLog("warn", "scherm", "Herladen niet mogelijk.");
    }
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f1519",
          color: "#eef2f4",
          display: "grid",
          placeItems: "center",
          fontFamily: "Source Sans 3, sans-serif",
        }}
      >
        <p style={{ fontSize: "42px", letterSpacing: "0.04em" }}>Het scherm herstelt.</p>
      </div>
    );
  }
}

export function clearScreenReloadGuard() {
  try {
    sessionStorage.removeItem(RELOAD_KEY);
  } catch {
    tvLog("warn", "scherm", "Herstelmarkering niet gewist.");
  }
}
