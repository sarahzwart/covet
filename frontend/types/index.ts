// Shared domain types. These mirror the Pydantic schemas the FastAPI backend
// will expose, so swapping the demo data layer for real API calls doesn't
// ripple through the UI.

export type SizeAvailability = "in_stock" | "out_of_stock" | "unknown";

export type ItemCategory =
  | "tops"
  | "bottoms"
  | "dresses"
  | "outerwear"
  | "shoes"
  | "accessories"
  | "other";

export interface ProductSize {
  /** Retailer's variant/SKU id — sizes can repeat across colors and fits, labels can't be trusted as ids. */
  id: string;
  label: string;
  availability: SizeAvailability;
}

/** A point-in-time read of a product from a retailer integration. */
export interface ProductSnapshot {
  retailerId: string;
  retailerName: string;
  url: string;
  title: string;
  imageUrl: string | null;
  /** null when the source didn't report a price. */
  price: number | null;
  currency: string;
  sizes: ProductSize[];
  category: ItemCategory | null;
  /** ISO 8601 timestamp of when this data was fetched. */
  fetchedAt: string;
  /** True for sample data. Demo data must never be presented as live. */
  isDemo: boolean;
}

export type TargetRule =
  | { type: "any_drop" }
  | { type: "price"; value: number }
  | { type: "percent_off"; value: number };

export interface PricePoint {
  observedAt: string;
  price: number | null;
  availability: SizeAvailability;
}

export interface TrackedItem {
  id: string;
  retailerId: string;
  retailerName: string;
  url: string;
  title: string;
  imageUrl: string | null;
  currency: string;
  category: ItemCategory;
  sizeId: string;
  sizeLabel: string;
  target: TargetRule;
  /** Price when tracking started; "any drop" and "% off" targets are relative to it. */
  baselinePrice: number;
  currentPrice: number | null;
  sizeAvailability: SizeAvailability;
  notifyEnabled: boolean;
  /** ISO timestamp of the last successful check, or null if never checked. */
  lastCheckedAt: string | null;
  createdAt: string;
  priceHistory: PricePoint[];
  isDemo: boolean;
}

export interface TrackProductInput {
  url: string;
  sizeId: string;
  category: ItemCategory;
  target: TargetRule;
}

/** Errors the data layer can report, so the UI can show a specific message. */
export type ApiErrorCode =
  | "invalid_url"
  | "unsupported_retailer"
  | "product_not_found"
  | "size_not_found"
  | "already_tracking"
  | "not_found"
  | "unavailable";
