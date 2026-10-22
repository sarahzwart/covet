import Link from "next/link";

import { DeleteItemButton } from "@/components/delete-item-button";
import { FreshnessNote } from "@/components/freshness-note";
import { NotifySwitch } from "@/components/notify-switch";
import { PriceSummary } from "@/components/price-summary";
import { ProductImage } from "@/components/product-image";
import { AvailabilityBadge, DemoBadge, TargetMetBadge } from "@/components/status-badges";
import { Card } from "@/components/ui/card";
import { CATEGORY_LABELS, isPriceAtTarget } from "@/lib/tracking";
import type { TrackedItem } from "@/types";

export function TrackedItemCard({ item }: { item: TrackedItem }) {
  return (
    <Card size="sm" className="flex-row gap-4 px-3">
      <ProductImage src={item.imageUrl} alt={item.title} className="w-20 shrink-0 sm:w-24" />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              {item.retailerName} · {CATEGORY_LABELS[item.category]}
            </p>
            <h3 className="truncate font-medium">
              <Link href={`/items/${item.id}`} className="hover:underline">
                {item.title}
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground">Size {item.sizeLabel}</p>
          </div>
          <DeleteItemButton itemId={item.id} itemTitle={item.title} />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <AvailabilityBadge availability={item.sizeAvailability} />
          {isPriceAtTarget(item) && <TargetMetBadge />}
          {item.isDemo && <DemoBadge />}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <PriceSummary {...item} />
            <FreshnessNote lastCheckedAt={item.lastCheckedAt} />
          </div>
          <NotifySwitch itemId={item.id} enabled={item.notifyEnabled} />
        </div>
      </div>
    </Card>
  );
}
