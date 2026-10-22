import Link from "next/link";

import { TrackedItemCard } from "@/components/tracked-item-card";
import { CATEGORY_LABELS } from "@/lib/tracking";
import { cn } from "@/lib/utils";
import type { TrackedItem } from "@/types";

export type GroupBy = "none" | "retailer" | "category";

export function parseGroupBy(value: string | string[] | undefined): GroupBy {
  return value === "retailer" || value === "category" ? value : "none";
}

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: "none", label: "All" },
  { value: "retailer", label: "By store" },
  { value: "category", label: "By type" },
];

/** Grouping lives in the URL (?group=...) so it survives reloads and can be shared. */
export function GroupByNav({ current }: { current: GroupBy }) {
  return (
    <nav aria-label="Group items" className="inline-flex rounded-lg bg-muted p-0.5">
      {GROUP_OPTIONS.map((option) => {
        const active = option.value === current;
        return (
          <Link
            key={option.value}
            href={option.value === "none" ? "/" : `/?group=${option.value}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground",
              active && "bg-background text-foreground shadow-sm",
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}

function groupItems(items: TrackedItem[], groupBy: GroupBy): { label: string; items: TrackedItem[] }[] {
  if (groupBy === "none") return [{ label: "", items }];

  const groups = new Map<string, TrackedItem[]>();
  for (const item of items) {
    const label = groupBy === "retailer" ? item.retailerName : CATEGORY_LABELS[item.category];
    groups.set(label, [...(groups.get(label) ?? []), item]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, groupItems]) => ({ label, items: groupItems }));
}

export function TrackedItemsList({ items, groupBy }: { items: TrackedItem[]; groupBy: GroupBy }) {
  return (
    <div className="flex flex-col gap-8">
      {groupItems(items, groupBy).map((group) => (
        <section key={group.label || "all"} aria-label={group.label || "All tracked items"}>
          {group.label && (
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">
              {group.label} <span className="font-normal">({group.items.length})</span>
            </h2>
          )}
          <ul className="grid gap-3 md:grid-cols-2">
            {group.items.map((item) => (
              <li key={item.id}>
                <TrackedItemCard item={item} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
