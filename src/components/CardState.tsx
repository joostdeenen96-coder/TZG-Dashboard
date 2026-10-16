import { AlertTriangle, Inbox, LoaderCircle } from "lucide-react";

type CardStateProps = {
  status: "loading" | "error" | "empty";
  title: string;
  message: string;
  className?: string;
};

const icons = {
  loading: LoaderCircle,
  error: AlertTriangle,
  empty: Inbox,
} as const;

export function CardState({ status, title, message, className = "" }: CardStateProps) {
  const Icon = icons[status];
  return (
    <div className={`tv-card flex h-full min-h-0 items-center gap-4 px-6 ${className}`} data-status={status}>
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] border border-veil/12 bg-veil/[0.06] text-gold">
        <Icon className={`h-6 w-6 ${status === "loading" ? "animate-spin" : ""}`} strokeWidth={2.1} />
      </span>
      <div className="min-w-0">
        <p className="font-display text-[28px] leading-none font-semibold tracking-[-0.015em]">{title}</p>
        <p className="mt-2 text-[18px] text-mist">{message}</p>
      </div>
    </div>
  );
}
