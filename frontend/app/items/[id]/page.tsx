import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";

import { DeleteItemButton } from "@/components/delete-item-button";
import { FreshnessNote } from "@/components/freshness-note";
import { NotifySwitch } from "@/components/notify-switch";
import { PriceHistoryTable } from "@/components/price-history-table";
import { PriceSummary } from "@/components/price-summary";
import { ProductImage } from "@/components/product-image";
import { AvailabilityBadge, DemoBadge, TargetMetBadge } from "@/components/status-badges";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTrackedItem } from "@/lib/api";
import { CATEGORY_LABELS, isPriceAtTarget } from "@/lib/tracking";

export async function generateMetadata({ params }: PageProps<"/items/[id]">): Promise<Metadata> {
  const item = await getTrackedItem((await params).id);
  return { title: item?.title ?? "Item not found" };
}

export default async function TrackedItemPage({ params }: PageProps<"/items/[id]">) {
  const item = await getTrackedItem((await params).id);
  if (!item) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm", className: "self-start" })}>
        <ArrowLeftIcon aria-hidden />
        All tracked items
      </Link>

      <Card>
        <CardContent className="flex flex-col gap-6 sm:flex-row">
          <ProductImage src={item.imageUrl} alt={item.title} className="w-full max-w-48 shrink-0 self-center sm:self-start" />

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">
                {item.retailerName} · {CATEGORY_LABELS[item.category]}
              </p>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">{item.title}</h1>
              <p className="text-muted-foreground">Size {item.sizeLabel}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <AvailabilityBadge availability={item.sizeAvailability} />
              {isPriceAtTarget(item) && <TargetMetBadge />}
              {item.isDemo && <DemoBadge />}
            </div>

            <div className="flex flex-col gap-1">
              <PriceSummary {...item} />
              <FreshnessNote lastCheckedAt={item.lastCheckedAt} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <NotifySwitch itemId={item.id} enabled={item.notifyEnabled} />
              <div className="flex gap-2">
                {!item.isDemo && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "outline" })}
                  >
                    View at {item.retailerName}
                    <ExternalLinkIcon aria-hidden />
                  </a>
                )}
                <DeleteItemButton itemId={item.id} itemTitle={item.title} redirectTo="/" showLabel />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Price history</CardTitle>
        </CardHeader>
        <CardContent>
          <PriceHistoryTable history={item.priceHistory} currency={item.currency} sizeLabel={item.sizeLabel} />
        </CardContent>
      </Card>
    </div>
  );
}
