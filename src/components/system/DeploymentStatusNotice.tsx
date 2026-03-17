import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { AlertIcon, ChevronRightIcon } from "@/components/ui/icons";

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
    <Card
      className={`border-amber-500/20 bg-amber-500/10 text-amber-50 ${
        compact ? "mb-6 px-4 py-4" : "mx-auto max-w-2xl px-6 py-5"
      }`}
      variant="muted"
    >
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-200">
          <AlertIcon size={18} />
        </div>
        <div className="flex-1">
          <p className="font-semibold">{title}</p>
          <p className={compact ? "mt-1 text-sm text-amber-100/80" : "mt-2 text-amber-100/80"}>{message}</p>
          {actionHref && actionLabel ? (
            <Link
              href={actionHref}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-amber-100 hover:text-white"
            >
              {actionLabel}
              <ChevronRightIcon size={14} />
            </Link>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
