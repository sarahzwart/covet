// The single data-access layer for the UI. Call it only from Server Components
// and Server Actions, never from the browser.
//
// Right now every function delegates to the in-memory demo backend. When the
// FastAPI endpoints exist, each body becomes a `fetch(`${API_URL}/api/...`)`
// call and the rest of the app stays unchanged.

import * as demo from "@/lib/demo-backend";
import type { ProductSnapshot, TrackedItem, TrackProductInput } from "@/types";

export { ApiError } from "@/lib/api-error";

/** True while data comes from the demo backend instead of a live integration. */
export const IS_DEMO_MODE = true;

export function previewProduct(url: string): Promise<ProductSnapshot> {
  return demo.previewProduct(url);
}

export function listTrackedItems(): Promise<TrackedItem[]> {
  return demo.listTrackedItems();
}

export function getTrackedItem(id: string): Promise<TrackedItem | null> {
  return demo.getTrackedItem(id);
}

export function trackProduct(input: TrackProductInput): Promise<TrackedItem> {
  return demo.trackProduct(input);
}

export function setNotificationsEnabled(id: string, enabled: boolean): Promise<TrackedItem> {
  return demo.setNotificationsEnabled(id, enabled);
}

export function deleteTrackedItem(id: string): Promise<void> {
  return demo.deleteTrackedItem(id);
}
