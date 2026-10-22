import { describeTarget, formatPrice } from "@/lib/tracking";
import type { TrackedItem } from "@/types";

type PriceSummaryProps = Pick<TrackedItem, "currentPrice" | "baselinePrice" | "currency" | "target">;

export function PriceSummary({ currentPrice, baselinePrice, currency, target }: PriceSummaryProps) {
  const dropped = currentPrice !== null && currentPrice < baselinePrice;

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
      <dt className="text-muted-foreground">Price</dt>
      <dd className="flex items-baseline gap-2">
        <span className="font-medium">{formatPrice(currentPrice, currency)}</span>
        {dropped && (
          <span className="text-xs text-muted-foreground line-through">
            <span className="sr-only">was </span>
            {formatPrice(baselinePrice, currency)}
          </span>
        )}
      </dd>
      <dt className="text-muted-foreground">Target</dt>
      <dd>{describeTarget(target, baselinePrice, currency)}</dd>
    </dl>
  );
}
