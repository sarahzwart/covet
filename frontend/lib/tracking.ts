// Display helpers for tracked items. These only describe state for the UI —
// whether an SMS is actually sent is decided by deterministic backend rules.

import type { ItemCategory, SizeAvailability, TargetRule, TrackedItem } from "@/types";

/** Data older than this is shown as stale. Should match the backend's freshness window. */
export const STALE_AFTER_HOURS = 24;

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  tops: "Tops",
  bottoms: "Bottoms",
  dresses: "Dresses",
  outerwear: "Outerwear",
  shoes: "Shoes",
  accessories: "Accessories",
  other: "Other",
};

export const AVAILABILITY_LABELS: Record<SizeAvailability, string> = {
  in_stock: "In stock",
  out_of_stock: "Out of stock",
  unknown: "Stock unverified",
};

/** The price the item must reach, or null for "any drop below baseline". */
export function targetPrice(target: TargetRule, baselinePrice: number): number | null {
  switch (target.type) {
    case "price":
      return target.value;
    case "percent_off":
      return Math.round(baselinePrice * (1 - target.value / 100) * 100) / 100;
    case "any_drop":
      return null;
  }
}

export function isPriceAtTarget(item: TrackedItem): boolean {
  if (item.currentPrice === null) return false;
  const goal = targetPrice(item.target, item.baselinePrice);
  return goal === null ? item.currentPrice < item.baselinePrice : item.currentPrice <= goal;
}

export type Freshness = "fresh" | "stale" | "never_checked";

export function freshness(lastCheckedAt: string | null, now: Date = new Date()): Freshness {
  if (!lastCheckedAt) return "never_checked";
  const ageHours = (now.getTime() - new Date(lastCheckedAt).getTime()) / 3_600_000;
  return ageHours > STALE_AFTER_HOURS ? "stale" : "fresh";
}

export function describeTarget(target: TargetRule, baselinePrice: number, currency: string): string {
  switch (target.type) {
    case "any_drop":
      return "Any price drop";
    case "price":
      return `${formatPrice(target.value, currency)} or less`;
    case "percent_off":
      return `${target.value}% off (${formatPrice(targetPrice(target, baselinePrice), currency)})`;
  }
}

export function formatPrice(amount: number | null, currency: string): string {
  if (amount === null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

const relativeTime = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const seconds = Math.round((new Date(iso).getTime() - now.getTime()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relativeTime.format(Math.round(seconds / size), unit);
  }
  return "just now";
}
