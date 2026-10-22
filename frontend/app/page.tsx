import Link from "next/link";
import { PlusIcon, ShoppingBagIcon } from "lucide-react";

import { GroupByNav, parseGroupBy, TrackedItemsList } from "@/components/tracked-items-list";
import { buttonVariants } from "@/components/ui/button";
import { listTrackedItems } from "@/lib/api";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const groupBy = parseGroupBy((await searchParams).group);
  const items = await listTrackedItems();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Tracked items</h1>
          <p className="text-sm text-muted-foreground">
            {items.length === 0
              ? "Nothing tracked yet."
              : `${items.length} ${items.length === 1 ? "item" : "items"} · you'll get a text when your size hits your price.`}
          </p>
        </div>
        {items.length > 0 && <GroupByNav current={groupBy} />}
      </div>

      {items.length === 0 ? <EmptyState /> : <TrackedItemsList items={items} groupBy={groupBy} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
      <ShoppingBagIcon className="size-10 text-muted-foreground" aria-hidden />
      <h2 className="font-medium">Start tracking your first item</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Paste a product link, pick your size, and set the price you&apos;d pay. We&apos;ll text you when
        it drops and your size is in stock.
      </p>
      <Link href="/track" className={buttonVariants({ className: "mt-2" })}>
        <PlusIcon aria-hidden />
        Track a product
      </Link>
    </div>
  );
}
