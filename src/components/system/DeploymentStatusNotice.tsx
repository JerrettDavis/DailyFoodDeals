import Link from "next/link";

interface DeploymentStatusNoticeProps {
  title: string;
  message: string;
  compact?: boolean;
  actionHref?: string;
  actionLabel?: string;
}

export function DeploymentStatusNotice({
  title,
  message,
  compact = false,
  actionHref,
  actionLabel,
}: DeploymentStatusNoticeProps) {
  return (
    <div
      className={`rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-100 ${
        compact ? "mb-6 px-4 py-3 text-sm" : "mx-auto max-w-2xl px-6 py-5"
      }`}
    >
      <p className="font-semibold">{title}</p>
      <p className={compact ? "mt-1 text-amber-100/80" : "mt-2 text-amber-100/80"}>{message}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-3 inline-flex text-sm font-medium text-amber-200 underline underline-offset-4 hover:text-white"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
