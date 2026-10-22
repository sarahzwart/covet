// In-memory stand-in for the FastAPI backend, used until it's wired up.
//
// Everything here is SAMPLE DATA: products, prices and stock are invented and
// every record is flagged `isDemo: true` so the UI labels it. Nothing here
// contacts a retailer. State lives in server memory and resets on restart.

import { ApiError } from "@/lib/api-error";
import { parseProductUrl } from "@/lib/retailers";
import type {
  ItemCategory,
  ProductSize,
  ProductSnapshot,
  SizeAvailability,
  TrackedItem,
  TrackProductInput,
} from "@/types";

interface DemoProduct {
  key: string;
  title: string;
  price: number;
  category: ItemCategory;
  sizes: [label: string, availability: SizeAvailability][];
}

const DEMO_CATALOG: DemoProduct[] = [
  {
    key: "linen-shirt",
    title: "Relaxed Linen-Blend Shirt",
    price: 70,
    category: "tops",
    sizes: [["XS", "in_stock"], ["S", "in_stock"], ["M", "out_of_stock"], ["L", "in_stock"], ["XL", "unknown"]],
  },
  {
    key: "straight-jean",
    title: "Ultra High Rise 90s Straight Jean",
    price: 90,
    category: "bottoms",
    sizes: [["24", "in_stock"], ["25", "out_of_stock"], ["26", "in_stock"], ["27", "in_stock"], ["28", "unknown"]],
  },
  {
    key: "wool-coat",
    title: "Wool-Blend Tailored Coat",
    price: 220,
    category: "outerwear",
    sizes: [["XS", "out_of_stock"], ["S", "in_stock"], ["M", "in_stock"], ["L", "out_of_stock"]],
  },
  {
    key: "slip-dress",
    title: "Satin Midi Slip Dress",
    price: 110,
    category: "dresses",
    sizes: [["XXS", "in_stock"], ["XS", "in_stock"], ["S", "unknown"], ["M", "in_stock"], ["L", "in_stock"]],
  },
];

const RETAILER = { id: "abercrombie", name: "Abercrombie & Fitch" };
const LATENCY_MS = 400;

function hashString(value: string): number {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

function toSizes(product: DemoProduct): ProductSize[] {
  return product.sizes.map(([label, availability]) => ({
    id: `${product.key}-${label.toLowerCase()}`,
    label,
    availability,
  }));
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

function seedItems(): TrackedItem[] {
  const [shirt, jean, coat] = DEMO_CATALOG;
  return [
    {
      id: "demo-1",
      retailerId: RETAILER.id,
      retailerName: RETAILER.name,
      url: "https://www.abercrombie.com/shop/us/p/demo-linen-shirt",
      title: shirt.title,
      imageUrl: null,
      currency: "USD",
      category: shirt.category,
      sizeId: "linen-shirt-s",
      sizeLabel: "S",
      target: { type: "price", value: 50 },
      baselinePrice: 70,
      currentPrice: 49,
      sizeAvailability: "in_stock",
      notifyEnabled: true,
      lastCheckedAt: hoursAgo(1),
      createdAt: hoursAgo(24 * 9),
      priceHistory: [
        { observedAt: hoursAgo(24 * 9), price: 70, availability: "in_stock" },
        { observedAt: hoursAgo(24 * 6), price: 70, availability: "in_stock" },
        { observedAt: hoursAgo(24 * 3), price: 56, availability: "out_of_stock" },
        { observedAt: hoursAgo(1), price: 49, availability: "in_stock" },
      ],
      isDemo: true,
    },
    {
      id: "demo-2",
      retailerId: RETAILER.id,
      retailerName: RETAILER.name,
      url: "https://www.abercrombie.com/shop/us/p/demo-straight-jean",
      title: jean.title,
      imageUrl: null,
      currency: "USD",
      category: jean.category,
      sizeId: "straight-jean-25",
      sizeLabel: "25",
      target: { type: "percent_off", value: 25 },
      baselinePrice: 90,
      currentPrice: 63,
      sizeAvailability: "out_of_stock",
      notifyEnabled: true,
      lastCheckedAt: hoursAgo(2),
      createdAt: hoursAgo(24 * 4),
      priceHistory: [
        { observedAt: hoursAgo(24 * 4), price: 90, availability: "in_stock" },
        { observedAt: hoursAgo(24 * 2), price: 72, availability: "out_of_stock" },
        { observedAt: hoursAgo(2), price: 63, availability: "out_of_stock" },
      ],
      isDemo: true,
    },
    {
      id: "demo-3",
      retailerId: RETAILER.id,
      retailerName: RETAILER.name,
      url: "https://www.abercrombie.com/shop/us/p/demo-wool-coat",
      title: coat.title,
      imageUrl: null,
      currency: "USD",
      category: coat.category,
      sizeId: "wool-coat-m",
      sizeLabel: "M",
      target: { type: "any_drop" },
      baselinePrice: 220,
      currentPrice: 220,
      sizeAvailability: "unknown",
      notifyEnabled: false,
      lastCheckedAt: hoursAgo(24 * 3),
      createdAt: hoursAgo(24 * 12),
      priceHistory: [
        { observedAt: hoursAgo(24 * 12), price: 220, availability: "in_stock" },
        { observedAt: hoursAgo(24 * 3), price: 220, availability: "unknown" },
      ],
      isDemo: true,
    },
  ];
}

// Keep state on globalThis so it survives dev-server hot reloads.
const globalStore = globalThis as unknown as { __covetDemoItems?: TrackedItem[] };
function items(): TrackedItem[] {
  globalStore.__covetDemoItems ??= seedItems();
  return globalStore.__covetDemoItems;
}

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

export async function previewProduct(rawUrl: string): Promise<ProductSnapshot> {
  await delay();

  const parsed = parseProductUrl(rawUrl);
  if (!parsed.ok) {
    throw parsed.reason === "invalid_url"
      ? new ApiError("invalid_url", "That doesn't look like a valid product URL.")
      : new ApiError("unsupported_retailer", "That retailer isn't supported yet.");
  }

  // Lets you exercise error states in the demo by putting these words in the URL.
  const path = parsed.url.pathname.toLowerCase();
  if (path.includes("not-found")) {
    throw new ApiError("product_not_found", "We couldn't find a product at that URL.");
  }
  if (path.includes("unavailable")) {
    throw new ApiError("unavailable", "Product data is temporarily unavailable. Try again later.");
  }

  const normalizedUrl = `${parsed.url.origin}${parsed.url.pathname}`;
  const product = DEMO_CATALOG[hashString(normalizedUrl) % DEMO_CATALOG.length];

  return {
    retailerId: parsed.retailer.id,
    retailerName: parsed.retailer.name,
    url: normalizedUrl,
    title: product.title,
    imageUrl: null,
    price: product.price,
    currency: "USD",
    sizes: toSizes(product),
    category: product.category,
    fetchedAt: new Date().toISOString(),
    isDemo: true,
  };
}

export async function listTrackedItems(): Promise<TrackedItem[]> {
  await delay();
  return [...items()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getTrackedItem(id: string): Promise<TrackedItem | null> {
  await delay();
  return items().find((item) => item.id === id) ?? null;
}

export async function trackProduct(input: TrackProductInput): Promise<TrackedItem> {
  // Re-read the product server-side rather than trusting details sent by the browser.
  const product = await previewProduct(input.url);

  const size = product.sizes.find((s) => s.id === input.sizeId);
  if (!size) throw new ApiError("size_not_found", "That size isn't available for this product.");
  if (product.price === null) {
    throw new ApiError("unavailable", "This product has no current price, so it can't be tracked yet.");
  }
  if (items().some((item) => item.url === product.url && item.sizeId === size.id)) {
    throw new ApiError("already_tracking", `You're already tracking size ${size.label} of this item.`);
  }

  const now = new Date().toISOString();
  const item: TrackedItem = {
    id: crypto.randomUUID(),
    retailerId: product.retailerId,
    retailerName: product.retailerName,
    url: product.url,
    title: product.title,
    imageUrl: product.imageUrl,
    currency: product.currency,
    category: input.category,
    sizeId: size.id,
    sizeLabel: size.label,
    target: input.target,
    baselinePrice: product.price,
    currentPrice: product.price,
    sizeAvailability: size.availability,
    notifyEnabled: true,
    lastCheckedAt: product.fetchedAt,
    createdAt: now,
    priceHistory: [{ observedAt: product.fetchedAt, price: product.price, availability: size.availability }],
    isDemo: true,
  };
  items().push(item);
  return item;
}

export async function setNotificationsEnabled(id: string, enabled: boolean): Promise<TrackedItem> {
  await delay();
  const item = items().find((i) => i.id === id);
  if (!item) throw new ApiError("not_found", "That tracked item no longer exists.");
  item.notifyEnabled = enabled;
  return item;
}

export async function deleteTrackedItem(id: string): Promise<void> {
  await delay();
  const list = items();
  const index = list.findIndex((i) => i.id === id);
  if (index === -1) throw new ApiError("not_found", "That tracked item no longer exists.");
  list.splice(index, 1);
}
