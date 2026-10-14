import { Component, type ReactNode } from "react";
import { tvLog } from "../services/tvLog";
import { CardState } from "./CardState";

type WidgetBoundaryProps = {
  title: string;
  className?: string;
  children: ReactNode;
};

type WidgetBoundaryState = {
  error: string | null;
};

export class WidgetBoundary extends Component<WidgetBoundaryProps, WidgetBoundaryState> {
  state: WidgetBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): WidgetBoundaryState {
    const message = error instanceof Error && error.message ? error.message : "Deze tegel is gestopt.";
    return { error: message };
  }

  componentDidCatch(error: unknown) {
    const message = error instanceof Error ? error.message : "Deze tegel is gestopt.";
    tvLog("error", this.props.title, `${message} Het scherm gaat door.`);
  }

  render() {
    const frame = `h-full min-h-0 min-w-0 ${this.props.className ?? ""}`;
    if (this.state.error) {
      return (
        <div className={frame}>
          <CardState status="error" title={this.props.title} message="Deze tegel is gestopt. Het scherm gaat door." />
        </div>
      );
    }
    return <div className={frame}>{this.props.children}</div>;
  }
}
