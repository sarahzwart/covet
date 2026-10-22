import { TriangleAlertIcon } from "lucide-react";

import { freshness, formatRelativeTime } from "@/lib/tracking";

export function FreshnessNote({ lastCheckedAt }: { lastCheckedAt: string | null }) {
  const state = freshness(lastCheckedAt);

  if (state === "never_checked" || !lastCheckedAt) {
    return <p className="text-xs text-muted-foreground">Not checked yet</p>;
  }

  const when = (
    <time dateTime={lastCheckedAt} title={new Date(lastCheckedAt).toLocaleString("en-US")}>
      {formatRelativeTime(lastCheckedAt)}
    </time>
  );

  if (state === "stale") {
    return (
      <p className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400">
        <TriangleAlertIcon className="size-3.5 shrink-0" aria-hidden />
        <span>Last checked {when}. Price and stock may be out of date.</span>
      </p>
    );
  }

  return <p className="text-xs text-muted-foreground">Checked {when}</p>;
}
