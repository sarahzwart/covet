"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import * as api from "@/lib/api";
import { CATEGORY_LABELS } from "@/lib/tracking";
import type { ItemCategory, ProductSnapshot, TargetRule } from "@/types";

const GENERIC_ERROR = "Something went wrong. Please try again.";

function errorMessage(error: unknown): string {
  if (error instanceof api.ApiError) return error.message;
  console.error(error);
  return GENERIC_ERROR;
}

// ---------------------------------------------------------------------------
// Preview a product URL
// ---------------------------------------------------------------------------

export type PreviewState =
  | { status: "idle" }
  | { status: "error"; message: string; url: string }
  | { status: "success"; product: ProductSnapshot };

export async function previewProductAction(_prev: PreviewState, formData: FormData): Promise<PreviewState> {
  const url = String(formData.get("url") ?? "").trim();
  if (!url) return { status: "error", message: "Paste a product URL to get started.", url };
  if (url.length > 2048) return { status: "error", message: "That URL is too long.", url };

  try {
    return { status: "success", product: await api.previewProduct(url) };
  } catch (error) {
    return { status: "error", message: errorMessage(error), url };
  }
}

// ---------------------------------------------------------------------------
// Start tracking a product
// ---------------------------------------------------------------------------

export type TrackFieldErrors = Partial<Record<"sizeId" | "category" | "targetValue", string>>;

export type TrackState = { status: "idle" } | { status: "error"; message?: string; fieldErrors: TrackFieldErrors };

const MAX_TARGET_PRICE = 100_000;

function parseTarget(type: string, rawValue: string): TargetRule | string {
  if (type === "any_drop") return { type: "any_drop" };

  const value = Number(rawValue);
  if (rawValue.trim() === "" || !Number.isFinite(value)) return "Enter a number.";

  if (type === "price") {
    if (value <= 0 || value > MAX_TARGET_PRICE) return "Enter a price greater than $0.";
    if (Math.round(value * 100) !== value * 100) return "Use at most two decimal places.";
    return { type: "price", value };
  }
  if (type === "percent_off") {
    if (!Number.isInteger(value) || value < 1 || value > 90) return "Enter a whole percentage from 1 to 90.";
    return { type: "percent_off", value };
  }
  return "Choose a target type.";
}

function isCategory(value: string): value is ItemCategory {
  return Object.hasOwn(CATEGORY_LABELS, value);
}

export async function trackProductAction(_prev: TrackState, formData: FormData): Promise<TrackState> {
  const url = String(formData.get("url") ?? "");
  const sizeId = String(formData.get("sizeId") ?? "");
  const category = String(formData.get("category") ?? "");
  const target = parseTarget(String(formData.get("targetType") ?? ""), String(formData.get("targetValue") ?? ""));

  if (!sizeId || !isCategory(category) || typeof target === "string") {
    return {
      status: "error",
      fieldErrors: {
        sizeId: sizeId ? undefined : "Choose your size.",
        category: isCategory(category) ? undefined : "Choose a category.",
        targetValue: typeof target === "string" ? target : undefined,
      },
    };
  }

  let itemId: string;
  try {
    const item = await api.trackProduct({ url, sizeId, category, target });
    itemId = item.id;
  } catch (error) {
    return { status: "error", message: errorMessage(error), fieldErrors: {} };
  }

  revalidatePath("/");
  // redirect() throws to navigate, so it must stay outside the try/catch.
  redirect(`/items/${itemId}`);
}

// ---------------------------------------------------------------------------
// Manage tracked items
// ---------------------------------------------------------------------------

export type MutationResult = { ok: true } | { ok: false; message: string };

export async function setNotificationsAction(id: string, enabled: boolean): Promise<MutationResult> {
  try {
    await api.setNotificationsEnabled(id, enabled);
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }
  revalidatePath("/");
  revalidatePath(`/items/${id}`);
  return { ok: true };
}

export async function deleteTrackedItemAction(id: string): Promise<MutationResult> {
  try {
    await api.deleteTrackedItem(id);
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }
  revalidatePath("/");
  return { ok: true };
}
